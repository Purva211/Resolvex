import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  UserCheck, 
  Clock, 
  MessageSquare, 
  Bot, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw,
  Send,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { SLAIndicator } from '../components/common/SLAIndicator';
import { ComplaintTimeline } from '../components/complaints/ComplaintTimeline';
import { SkeletonCard } from '../components/common/Skeleton';

const STAFF_STATUSES = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'REOPENED', 'CLOSED'];

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [agents, setAgents] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  async function loadComplaint() {
    setError('');
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setSelectedStatus(res.data.status);
      setResolutionText(res.data.resolution || '');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load complaint details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaint();
    if (user?.role === 'admin') {
      api.get('/users/agents').then((r) => setAgents(r.data)).catch(() => {});
    }
  }, [id]);

  async function handleStatusUpdate(nextStatus = selectedStatus, customResolution) {
    setError('');
    try {
      await api.put(`/complaints/${id}/status`, {
        status: nextStatus,
        resolution: customResolution !== undefined ? customResolution : resolutionText
      });
      setShowReopenForm(false);
      await loadComplaint();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update status');
    }
  }

  async function handleAssign(agentId) {
    if (!agentId) return;
    setError('');
    try {
      await api.put(`/complaints/${id}/assign`, { agentId });
      await loadComplaint();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not assign agent');
    }
  }

  async function handleAddComment(e) {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    setError('');
    try {
      await api.post(`/complaints/${id}/comments`, { text: commentText.trim() });
      setCommentText('');
      await loadComplaint();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not add comment');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6"><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="error-card">
        <h3 className="font-bold text-rose-300 text-sm">Error Loading Complaint</h3>
        <p className="text-xs text-rose-200 mt-1">{error}</p>
        <button onClick={() => navigate('/complaints')} className="btn btn-secondary text-xs mt-3">
          Back to Complaints
        </button>
      </div>
    );
  }

  const c = complaint;
  const isCustomer = user?.role === 'customer';
  const isStaff = user?.role === 'admin' || user?.role === 'agent';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="complaint-details-page space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => navigate('/complaints')}
          className="btn btn-ghost text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5 px-3 py-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-2.5">
          <PriorityBadge priority={c.priority} />
          <StatusBadge status={c.status} />
        </div>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-indigo-400 text-xs sm:text-sm">{c.complaintId}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">Created {new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{c.title}</h1>
          </div>

          <div className="flex-shrink-0">
            <SLAIndicator complaint={c} />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-card">
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ticket Details, AI Analysis, Controls & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="card">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 mb-4">
              Ticket Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-5">
              <div>
                <span className="text-slate-400 block mb-1">Category</span>
                <span className="font-medium text-slate-200 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-md inline-block">{c.category}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-medium text-slate-200">{c.department || 'Customer Service'}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Status</span>
                <span className="font-medium text-slate-200">{c.status}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Customer</span>
                <span className="font-medium text-slate-200">{c.customer?.name || 'Unknown'} ({c.customer?.email || 'N/A'})</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Assigned Agent</span>
                <span className="font-medium text-slate-200">{c.assignedTo?.name || 'Unassigned'}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">SLA Timeframe</span>
                <span className="font-medium text-indigo-400">{c.slaHours || 48} hours</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Description</span>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                {c.description}
              </p>
            </div>

            {/* AI Analysis Box */}
            {c.aiAnalysis?.used && (
              <div className="mt-5 p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Bot size={16} />
                  <span className="font-bold text-xs">🤖 AI Classification Recommendation Used</span>
                </div>
                <div className="text-xs text-slate-300 grid grid-cols-3 gap-2 py-1">
                  <div><span className="text-slate-400">Category:</span> <strong className="text-slate-200">{c.aiAnalysis.category}</strong></div>
                  <div><span className="text-slate-400">Priority:</span> <strong className="text-slate-200">{c.aiAnalysis.priority}</strong></div>
                  <div><span className="text-slate-400">Department:</span> <strong className="text-slate-200">{c.aiAnalysis.department}</strong></div>
                </div>
                {c.aiAnalysis.reason && (
                  <p className="text-xs text-slate-300 border-t border-indigo-900/60 pt-2.5 mt-1">
                    <strong className="text-indigo-400">Reasoning:</strong> {c.aiAnalysis.reason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Admin Agent Assignment Controls */}
          {isAdmin && (
            <div className="card">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 mb-3">
                <UserCheck size={16} className="text-indigo-400" />
                <span>Assign Ticket Agent</span>
              </h3>
              <div className="flex gap-3">
                <select
                  value={c.assignedTo?._id || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="select-field flex-1 text-xs"
                >
                  <option value="">Select Agent...</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Staff Status & Resolution Controls */}
          {isStaff && (
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 mb-1">Update Status & Resolution</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="select-field text-xs"
                  >
                    {STAFF_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED' || c.resolution) && (
                <div>
                  <label className="input-label">Resolution Details</label>
                  <textarea
                    rows={4}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Provide detailed explanation of how this complaint was resolved..."
                    className="textarea-field text-xs"
                  />
                </div>
              )}

              <button
                onClick={() => handleStatusUpdate()}
                className="btn btn-primary text-xs"
              >
                Update Ticket Status
              </button>
            </div>
          )}

          {/* Customer Review Box for Resolved Complaint */}
          {isCustomer && c.status === 'RESOLVED' && (
            <div className="card bg-emerald-950/40 border-emerald-800/60 space-y-4">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm">Complaint Resolved 🎉</h3>
              </div>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Support has marked your issue as resolved. Please review the resolution details below and confirm to close or reopen if unsatisfied.
              </p>

              {c.resolution && (
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-800/50 text-xs text-slate-200">
                  <strong className="text-emerald-400">Resolution note:</strong> {c.resolution}
                </div>
              )}

              {!showReopenForm ? (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={() => handleStatusUpdate('CLOSED')}
                    className="btn btn-emerald text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Yes, Close Complaint</span>
                  </button>
                  <button
                    onClick={() => setShowReopenForm(true)}
                    className="btn btn-secondary text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>No, Reopen Complaint</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-3 border-t border-emerald-900/60">
                  <label className="input-label text-rose-300">Why are you reopening this complaint?</label>
                  <textarea
                    rows={3}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Explain what was unresolved..."
                    className="textarea-field text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate('REOPENED')}
                      className="btn btn-danger text-xs"
                    >
                      Confirm Reopen
                    </button>
                    <button
                      onClick={() => setShowReopenForm(false)}
                      className="btn btn-ghost text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-400" />
              <span>Ticket Comments ({c.comments?.length || 0})</span>
            </h3>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {c.comments?.length ? (
                c.comments.map((x) => (
                  <div key={x._id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-100">{x.user?.name || 'User'} <span className="text-[11px] text-slate-400 font-normal">({x.user?.role || 'user'})</span></span>
                      <span className="text-[11px] text-slate-400">{new Date(x.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{x.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No comments added yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 flex gap-2.5">
              <input
                type="text"
                maxLength={2000}
                placeholder="Write a comment or message..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="input-field flex-1 text-xs"
              />
              <button type="submit" className="btn btn-primary text-xs flex items-center gap-1.5 flex-shrink-0">
                <Send size={14} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Visual Timeline */}
        <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              <span>Activity Timeline</span>
            </h3>

            <ComplaintTimeline history={c.history || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
