const mongoose = require('mongoose');

const CATEGORIES = ['Payment','Technical','Delivery','Product','Account','Service','Other'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const DEPARTMENTS = ['Finance','Technical Support','Delivery','Product Support','Customer Service'];
const STATUSES = ['NEW','ASSIGNED','IN_PROGRESS','WAITING_FOR_CUSTOMER','RESOLVED','REOPENED','CLOSED'];

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const historySchema = new mongoose.Schema({
  action: String,
  message: String,
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const aiAnalysisSchema = new mongoose.Schema({
  used: { type: Boolean, default: false },
  category: String,
  priority: String,
  department: String,
  slaHours: Number,
  reason: String,
  generatedAt: Date
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, enum: CATEGORIES, default: 'Other' },
  priority: { type: String, enum: PRIORITIES, default: 'MEDIUM' },
  department: { type: String, enum: DEPARTMENTS, default: 'Customer Service' },
  status: { type: String, enum: STATUSES, default: 'NEW' },
  slaHours: { type: Number, default: 48 },
  slaDueAt: Date,
  aiAnalysis: { type: aiAnalysisSchema, default: () => ({ used: false }) },
  resolution: { type: String, default: '', maxlength: 5000 },
  resolvedAt: { type: Date, default: null },
  slaBreachedAt: { type: Date, default: null },
  comments: [commentSchema],
  history: [historySchema]
}, { timestamps: true });

complaintSchema.index({ status: 1, slaDueAt: 1 });
complaintSchema.index({ priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.STATUSES = STATUSES;
