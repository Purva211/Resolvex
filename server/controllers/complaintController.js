const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { getSlaHours, getSlaDueAt } = require('../utils/sla');
const { CATEGORIES, PRIORITIES, DEPARTMENTS } = require('../models/Complaint');
const {
  notifyComplaintCreated,
  notifyComplaintAssigned,
  notifyComplaintResolved,
  notifyComplaintReopened
} = require('../services/notificationService');
const { sendComplaintResolvedEmail } = require('../services/emailService');

const populate = q => q.populate('customer','name email')
  .populate('assignedTo','name email role')
  .populate('comments.user','name role')
  .populate('history.by','name role');

async function makeId() {
  // Avoid count-based collisions after deletes/concurrent requests.
  const year = new Date().getFullYear();
  const latest = await Complaint.findOne({ complaintId: new RegExp(`^CMP-${year}-`) }).sort({ complaintId: -1 }).select('complaintId');
  const next = latest ? Number(latest.complaintId.split('-').pop()) + 1 : 1;
  return `CMP-${year}-${String(next).padStart(5,'0')}`;
}

function tokenize(text) {
  return new Set(String(text).toLowerCase()
    .replace(/[^a-z0-9\\s]/g, ' ')
    .split(/\\s+/).filter(w => w.length > 2));
}

function similarity(a, b) {
  const A = tokenize(a), B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let intersection = 0;
  for (const word of A) if (B.has(word)) intersection++;
  return intersection / (A.size + B.size - intersection);
}

async function findDuplicates(userId, title, description, category) {
  const recent = await Complaint.find({
    customer: userId,
    ...(category && category !== 'Other' ? { category } : {}),
    status: { $nin: ['CLOSED'] }
  }).sort('-createdAt').limit(100).select('complaintId title description category status createdAt');

  const text = `${title} ${description}`;
  return recent.map(c => ({ complaint: c, score: similarity(text, `${c.title} ${c.description}`) }))
    .filter(x => x.score >= 0.35)
    .sort((a,b) => b.score - a.score)
    .slice(0, 3);
}

exports.checkDuplicates = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    const matches = await findDuplicates(req.user._id, title, description, category);
    res.json({
      duplicates: matches.map(({ complaint, score }) => ({
        _id: complaint._id,
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        status: complaint.status,
        createdAt: complaint.createdAt,
        similarity: Math.round(score * 100)
      }))
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category, priority, department, aiAnalysis, confirmDuplicate } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    if (String(title).trim().length > 150) return res.status(400).json({ message: 'Title cannot exceed 150 characters' });
    if (String(description).trim().length > 5000) return res.status(400).json({ message: 'Description cannot exceed 5000 characters' });

    const finalCategory = CATEGORIES.includes(category) ? category : 'Other';
    const finalPriority = PRIORITIES.includes(priority) ? priority : 'MEDIUM';
    const finalDepartment = DEPARTMENTS.includes(department) ? department : 'Customer Service';

    if (!confirmDuplicate) {
      const matches = await findDuplicates(req.user._id, title, description, finalCategory);
      if (matches.length) {
        return res.status(409).json({
          code: 'POSSIBLE_DUPLICATE',
          message: 'A similar active complaint already exists.',
          duplicates: matches.map(({ complaint, score }) => ({
            _id: complaint._id, complaintId: complaint.complaintId, title: complaint.title,
            category: complaint.category, status: complaint.status,
            similarity: Math.round(score * 100)
          }))
        });
      }
    }

    const slaHours = getSlaHours(finalPriority);
    const complaint = await Complaint.create({
      complaintId: await makeId(),
      customer: req.user._id,
      title: String(title).trim(),
      description: String(description).trim(),
      category: finalCategory,
      priority: finalPriority,
      department: finalDepartment,
      slaHours,
      slaDueAt: getSlaDueAt(finalPriority),
      aiAnalysis: aiAnalysis?.used ? {
        used: true, category: aiAnalysis.category, priority: aiAnalysis.priority,
        department: aiAnalysis.department, slaHours,
        reason: String(aiAnalysis.reason || '').slice(0, 500),
        generatedAt: aiAnalysis.generatedAt ? new Date(aiAnalysis.generatedAt) : new Date()
      } : { used: false },
      history: [{
        action:'CREATED',
        message:`Complaint created. Category: ${finalCategory}, Priority: ${finalPriority}, Department: ${finalDepartment}`,
        by:req.user._id
      }]
    });

    await notifyComplaintCreated(complaint);
    res.status(201).json(await populate(Complaint.findById(complaint._id)));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.list = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'customer') filter.customer = req.user._id;
    if (req.user.role === 'agent') filter.assignedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.department) filter.department = req.query.department;
    const data = await populate(Complaint.find(filter).sort('-createdAt'));
    res.json(data);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const complaint = await populate(Complaint.findById(req.params.id));
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    const allowed = req.user.role === 'admin' ||
      String(complaint.customer._id) === String(req.user._id) ||
      (complaint.assignedTo && String(complaint.assignedTo._id) === String(req.user._id));
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    res.json(complaint);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.assign = async (req, res) => {
  try {
    const { agentId } = req.body;
    const agent = await User.findOne({ _id: agentId, role:'agent' });
    if (!agent) return res.status(400).json({ message:'Valid agent required' });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message:'Complaint not found' });
    const oldAgent = complaint.assignedTo;
    complaint.assignedTo = agent._id;
    if (complaint.status === 'NEW') complaint.status = 'ASSIGNED';
    complaint.history.push({ action:'ASSIGNED', message:`Assigned to ${agent.name}`, by:req.user._id });
    await complaint.save();
    if (!oldAgent || String(oldAgent) !== String(agent._id)) await notifyComplaintAssigned(complaint, agent);
    res.json(await populate(Complaint.findById(complaint._id)));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.status = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const valid = ['NEW','ASSIGNED','IN_PROGRESS','WAITING_FOR_CUSTOMER','RESOLVED','REOPENED','CLOSED'];
    if (!valid.includes(status)) return res.status(400).json({ message:'Invalid status' });

    const complaint = await Complaint.findById(req.params.id).populate('customer','name email').populate('assignedTo','name email');
    if (!complaint) return res.status(404).json({ message:'Complaint not found' });

    const isCustomer = req.user.role === 'customer';
    const isStaff = req.user.role === 'admin' || req.user.role === 'agent';

    if (req.user.role === 'agent' && (!complaint.assignedTo || String(complaint.assignedTo._id) !== String(req.user._id))) {
      return res.status(403).json({ message:'Not assigned to you' });
    }
    if (isCustomer && String(complaint.customer._id) !== String(req.user._id)) return res.status(403).json({ message:'Access denied' });
    if (isCustomer && !['CLOSED','REOPENED'].includes(status)) return res.status(403).json({ message:'Customer review can only close or reopen a resolved complaint' });
    if (isCustomer && complaint.status !== 'RESOLVED') return res.status(400).json({ message:'Complaint can be closed or reopened only after it is resolved' });

    const old = complaint.status;
    complaint.status = status;
    if (resolution !== undefined && isStaff) complaint.resolution = resolution;

    if (status === 'RESOLVED' && old !== 'RESOLVED') {
      complaint.resolvedAt = new Date();
    }
    if (status === 'REOPENED') {
      complaint.resolvedAt = null;
      complaint.slaDueAt = getSlaDueAt(complaint.priority);
      complaint.slaHours = getSlaHours(complaint.priority);
      complaint.slaBreachedAt = null;
    }

    const action = status === 'CLOSED' && isCustomer ? 'CUSTOMER_ACCEPTED' :
      status === 'REOPENED' && isCustomer ? 'CUSTOMER_REOPENED' : 'STATUS_CHANGED';
    const message = status === 'CLOSED' && isCustomer ? 'Customer accepted the resolution and closed the complaint.' :
      status === 'REOPENED' && isCustomer ? 'Customer reopened the complaint.' : `${old} → ${status}`;

    complaint.history.push({ action, message, by:req.user._id });
    await complaint.save();

    if (status === 'RESOLVED' && old !== 'RESOLVED') {
      await notifyComplaintResolved(complaint);
      try {
        await sendComplaintResolvedEmail({
          customerEmail: complaint.customer.email,
          customerName: complaint.customer.name,
          complaintId: complaint.complaintId,
          title: complaint.title,
          category: complaint.category,
          resolution: complaint.resolution
        });
      } catch (emailError) {
        console.error('Resolution email failed:', emailError.message);
      }
    }
    if (status === 'REOPENED' && old !== 'REOPENED') await notifyComplaintReopened(complaint);

    res.json(await populate(Complaint.findById(complaint._id)));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.comment = async (req, res) => {
  try {
    if (!req.body.text || String(req.body.text).trim().length > 2000) return res.status(400).json({ message:'Comment is required and must be <= 2000 characters' });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message:'Complaint not found' });
    const allowed = req.user.role === 'admin' || String(complaint.customer) === String(req.user._id) ||
      (complaint.assignedTo && String(complaint.assignedTo) === String(req.user._id));
    if (!allowed) return res.status(403).json({ message:'Access denied' });
    complaint.comments.push({ user:req.user._id, text:String(req.body.text).trim() });
    complaint.history.push({ action:'COMMENT_ADDED', message:'A comment was added', by:req.user._id });
    await complaint.save();
    res.json(await populate(Complaint.findById(complaint._id)));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.dashboard = async (req, res) => {
  try {
    const match = req.user.role === 'customer' ? { customer:req.user._id } :
      req.user.role === 'agent' ? { assignedTo:req.user._id } : {};

    const active = { $nin:['RESOLVED','CLOSED'] };
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [total, open, assigned, investigating, resolved, closed, reopened, critical, breached, dueSoon, avgData] = await Promise.all([
      Complaint.countDocuments(match),
      Complaint.countDocuments({ ...match, status:'NEW' }),
      Complaint.countDocuments({ ...match, status:'ASSIGNED' }),
      Complaint.countDocuments({ ...match, status:'IN_PROGRESS' }),
      Complaint.countDocuments({ ...match, status:'RESOLVED' }),
      Complaint.countDocuments({ ...match, status:'CLOSED' }),
      Complaint.countDocuments({ ...match, status:'REOPENED' }),
      Complaint.countDocuments({ ...match, priority:'CRITICAL' }),
      Complaint.countDocuments({ ...match, slaDueAt:{ $lt:now }, status:active }),
      Complaint.countDocuments({ ...match, slaDueAt:{ $gte:now, $lte:soon }, status:active }),
      Complaint.aggregate([
        { $match: { ...match, resolvedAt: { $ne:null } } },
        { $project: { duration: { $subtract: ['$resolvedAt','$createdAt'] } } },
        { $group: { _id:null, avgMs: { $avg:'$duration' } } }
      ])
    ]);

    const avgResolutionHours = avgData[0] ? Number((avgData[0].avgMs / 3600000).toFixed(1)) : 0;
    const categoryAgg = await Complaint.aggregate([
      { $match: match },
      { $group: { _id:'$category', count:{ $sum:1 } } },
      { $sort: { count:-1 } }
    ]);
    const categoryTotal = categoryAgg.reduce((sum,x)=>sum+x.count,0);
    const categories = categoryAgg.map(x => ({ category:x._id, count:x.count, percentage:categoryTotal ? Math.round(x.count/categoryTotal*100) : 0 }));

    const agentPerformance = req.user.role === 'admin' ? await User.aggregate([
      { $match:{ role:'agent' } },
      { $lookup:{ from:'complaints', localField:'_id', foreignField:'assignedTo', as:'complaints' } },
      { $project:{
        agent:'$name',
        assigned:{ $size:'$complaints' },
        resolved:{ $size:{ $filter:{ input:'$complaints', as:'c', cond:{ $in:['$$c.status',['RESOLVED','CLOSED']] } } } },
        pending:{ $size:{ $filter:{ input:'$complaints', as:'c', cond:{ $not:[{ $in:['$$c.status',['RESOLVED','CLOSED']] }] } } } }
      }},
      { $sort:{ assigned:-1 } }
    ]) : [];

    const trends = await Complaint.aggregate([
      { $match: match },
      { $group:{ _id:{ $dateToString:{ format:'%Y-%m-%d', date:'$createdAt' } }, count:{ $sum:1 } } },
      { $sort:{ _id:1 } },
      { $limit:14 }
    ]);

    const slaTotal = await Complaint.countDocuments({ ...match, slaDueAt:{ $ne:null } });
    const slaBreached = await Complaint.countDocuments({ ...match, slaDueAt:{ $lt:now }, status:active });
    const dueSoonCount = dueSoon;
    const withinSla = Math.max(slaTotal - slaBreached - dueSoonCount, 0);

    res.json({
      total, open, assigned, investigating, resolved, closed, reopened, critical, breached, dueSoon,
      avgResolutionHours, categories, agentPerformance, trends,
      sla:{ within:withinSla, dueSoon:dueSoonCount, breached:slaBreached, total:slaTotal }
    });
  } catch (e) { res.status(500).json({ message:e.message }); }
};
