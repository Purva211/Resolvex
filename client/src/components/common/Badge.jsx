import React from 'react';

export function PriorityBadge({ priority = 'MEDIUM' }) {
  const p = String(priority).toUpperCase();
  const classMap = {
    LOW: 'badge-priority-low',
    MEDIUM: 'badge-priority-medium',
    HIGH: 'badge-priority-high',
    CRITICAL: 'badge-priority-critical'
  };

  const icons = {
    LOW: '●',
    MEDIUM: '●',
    HIGH: '▲',
    CRITICAL: '🔥'
  };

  return (
    <span className={`badge ${classMap[p] || 'badge-priority-medium'}`}>
      <span className="badge-icon">{icons[p] || '●'}</span>
      {p}
    </span>
  );
}

export function StatusBadge({ status = 'NEW' }) {
  const s = String(status).toUpperCase();
  const classMap = {
    NEW: 'badge-status-new',
    ASSIGNED: 'badge-status-assigned',
    IN_PROGRESS: 'badge-status-progress',
    WAITING_FOR_CUSTOMER: 'badge-status-waiting',
    RESOLVED: 'badge-status-resolved',
    CLOSED: 'badge-status-closed',
    REOPENED: 'badge-status-reopened'
  };

  const labels = {
    NEW: 'New',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    WAITING_FOR_CUSTOMER: 'Waiting Customer',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REOPENED: 'Reopened'
  };

  return (
    <span className={`badge ${classMap[s] || 'badge-status-new'}`}>
      <span className="status-dot" />
      {labels[s] || s}
    </span>
  );
}
