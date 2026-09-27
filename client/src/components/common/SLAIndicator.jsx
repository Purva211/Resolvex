import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function SLAIndicator({ complaint }) {
  if (!complaint || !complaint.slaDueAt) {
    return <span className="sla-tag sla-none">—</span>;
  }

  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(complaint.status);
  if (isResolvedOrClosed) {
    return (
      <span className="sla-tag sla-met">
        <CheckCircle2 size={13} />
        <span>Resolved</span>
      </span>
    );
  }

  const due = new Date(complaint.slaDueAt).getTime();
  const now = new Date().getTime();
  const diffMs = due - now;

  if (diffMs <= 0) {
    return (
      <span className="sla-tag sla-breached">
        <AlertTriangle size={13} />
        <span>SLA Breached</span>
      </span>
    );
  }

  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
  const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = `${hoursLeft}h ${minsLeft}m remaining`;
  if (hoursLeft === 0) timeString = `${minsLeft}m remaining`;
  if (hoursLeft > 48) timeString = `${Math.floor(hoursLeft / 24)}d remaining`;

  const isUrgent = hoursLeft < 12;

  return (
    <span className={`sla-tag ${isUrgent ? 'sla-urgent' : 'sla-normal'}`}>
      <Clock size={13} />
      <span>{timeString}</span>
    </span>
  );
}
