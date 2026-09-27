import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SLAAttentionBanner({ breachedCount = 0, dueSoonCount = 0 }) {
  const navigate = useNavigate();

  if (breachedCount === 0 && dueSoonCount === 0) return null;

  return (
    <div className={`sla-attention-banner ${breachedCount > 0 ? 'banner-danger' : 'banner-warning'}`}>
      <div className="banner-left">
        <div className="banner-icon-wrap">
          <AlertTriangle size={22} />
        </div>
        <div className="banner-text">
          <h3 className="banner-title">⚠️ SLA Attention Required</h3>
          <p className="banner-desc">
            {breachedCount > 0 && (
              <strong className="text-rose-700 mr-2">{breachedCount} complaint(s) breached SLA.</strong>
            )}
            {dueSoonCount > 0 && (
              <span>{dueSoonCount} complaint(s) due within 24 hours.</span>
            )}
          </p>
        </div>
      </div>

      <button 
        onClick={() => navigate(breachedCount > 0 ? '/complaints?status=open&priority=CRITICAL' : '/complaints?status=open')} 
        className="btn btn-warning-action text-xs font-semibold flex items-center gap-1.5"
      >
        <span>View Urgent Complaints</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
