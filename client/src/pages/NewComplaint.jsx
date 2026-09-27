import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Sparkles } from 'lucide-react';
import api from '../services/api';
import { AIComplaintAssistant } from '../components/ai/AIComplaintAssistant';

const CATEGORIES = ['Payment', 'Technical', 'Delivery', 'Product', 'Account', 'Service', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const DEPARTMENTS = ['Finance', 'Technical Support', 'Delivery', 'Product Support', 'Customer Service'];

const defaultForm = {
  title: '',
  description: '',
  category: 'Other',
  priority: 'MEDIUM',
  department: 'Customer Service'
};

export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [duplicates, setDuplicates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  async function handleAIAnalyze() {
    setAiError('');
    setSubmitError('');
    if (!form.description.trim()) {
      setAiError('Please enter a detailed complaint description before running AI analysis.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.post('/ai/analyze-complaint', { description: form.description });
      setAiResult(res.data.analysis);
    } catch (err) {
      setAiResult(null);
      setAiError(err.response?.data?.message || 'AI analysis is currently unavailable. You can classify your complaint manually.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleApplyAISuggestions() {
    if (!aiResult) return;
    setForm((prev) => ({
      ...prev,
      category: aiResult.category || prev.category,
      priority: aiResult.priority || prev.priority,
      department: aiResult.department || prev.department
    }));
  }

  async function handleSubmit(e, forceCreate = false) {
    if (e) e.preventDefault();
    setSubmitError('');

    if (!form.title.trim() || !form.description.trim()) {
      setSubmitError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        ...form,
        confirmDuplicate: forceCreate,
        aiAnalysis: aiResult ? {
          used: true,
          category: aiResult.category,
          priority: aiResult.priority,
          department: aiResult.department,
          slaHours: aiResult.slaHours,
          reason: aiResult.reason,
          generatedAt: new Date().toISOString()
        } : { used: false }
      });

      setDuplicates([]);
      navigate(`/complaints/${res.data._id}`);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.code === 'POSSIBLE_DUPLICATE') {
        setDuplicates(err.response.data.duplicates || []);
        return;
      }
      setSubmitError(err.response?.data?.message || 'Could not create complaint ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="new-complaint-page max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/complaints')}
        className="btn btn-ghost text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5 px-3 py-1.5"
      >
        <ArrowLeft size={14} />
        <span>Back to Complaints</span>
      </button>

      <div className="page-header pb-1">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Create New Complaint</h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit your issue and receive an AI recommendation for category, priority and department classification.
        </p>
      </div>

      {submitError && (
        <div className="error-card">
          <p className="text-xs text-rose-300">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="card space-y-5">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 mb-1">
            1. Complaint Information
          </h3>

          <div>
            <label className="input-label">Title / Summary <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              maxLength={150}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Account charged twice after failed checkout"
              className="input-field"
            />
            <span className="text-[11px] text-slate-400 mt-1.5 block">Short description of the issue (max 150 chars)</span>
          </div>

          <div>
            <label className="input-label">Detailed Description <span className="text-rose-400">*</span></label>
            <textarea
              rows={6}
              required
              maxLength={5000}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Explain what happened in detail, including order IDs, transaction references, or steps to reproduce..."
              className="textarea-field"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Provide clear details for faster resolution</span>
              <span>{form.description.length} / 5000</span>
            </div>
          </div>
        </div>

        {/* AI Assistant UI */}
        <AIComplaintAssistant
          onAnalyze={handleAIAnalyze}
          aiResult={aiResult}
          analyzing={analyzing}
          aiError={aiError}
          onApply={handleApplyAISuggestions}
          description={form.description}
        />

        {/* Duplicate Alert Popup */}
        {duplicates.length > 0 && (
          <div className="duplicate-alert-card">
            <div className="flex items-start gap-3.5">
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-300 text-sm">⚠️ Similar Complaint Found</h4>
                <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                  ResolveX found active complaints with similar descriptions. Review existing complaints or proceed creating a new ticket.
                </p>

                <div className="space-y-2.5 mt-3.5">
                  {duplicates.map((d) => (
                    <div key={d._id} className="duplicate-item-box">
                      <div>
                        <span className="font-mono font-bold text-indigo-400 text-xs">{d.complaintId}</span>
                        <p className="font-medium text-slate-100 text-xs mt-0.5">{d.title}</p>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {d.category} · {d.status} · {d.similarity}% match
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/complaints/${d._id}`)}
                        className="btn btn-secondary text-xs"
                      >
                        View Existing
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSubmit(null, true)}
                    className="btn btn-warning-action text-xs"
                  >
                    Create New Ticket Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Classification Section */}
        <div className="card space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-1">
            <h3 className="font-bold text-slate-100 text-sm">2. Final Classification & Routing</h3>
            <span className="text-[11px] text-slate-400 font-medium">Human Review Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="select-field"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Priority Level</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="select-field"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Department</label>
              <select
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                className="select-field"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-400 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <strong className="text-slate-200">Human Review:</strong> AI provides decision recommendations, but you retain final control. The backend automatically calculates SLA hours based on the priority selected above.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="btn btn-ghost text-xs px-4"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex items-center gap-2 px-5"
          >
            <Check size={16} />
            <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
