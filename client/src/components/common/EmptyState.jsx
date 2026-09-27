import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No complaints found", 
  description = "No items match your current criteria or filter selection.",
  actionLink,
  actionText = "Create Complaint"
}) {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-wrap">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary mt-4">
          <Plus size={16} className="mr-1.5" />
          {actionText}
        </Link>
      )}
    </div>
  );
}
