import React from 'react';
import { CheckCircle2, Clock, MessageSquare, AlertOctagon, UserCheck, PlayCircle, ShieldCheck } from 'lucide-react';

export function ComplaintTimeline({ history = [] }) {
  if (!history.length) {
    return <p className="text-xs text-slate-400 py-4 text-center">No activity history recorded yet.</p>;
  }

  const getActionConfig = (action) => {
    switch (action) {
      case 'CREATED':
        return { icon: PlayCircle, color: 'text-blue-400 bg-blue-950/60 border-blue-800/80' };
      case 'ASSIGNED':
        return { icon: UserCheck, color: 'text-purple-400 bg-purple-950/60 border-purple-800/80' };
      case 'STATUS_CHANGED':
        return { icon: Clock, color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' };
      case 'COMMENT_ADDED':
        return { icon: MessageSquare, color: 'text-slate-300 bg-slate-800/80 border-slate-700/80' };
      case 'SLA_BREACHED':
        return { icon: AlertOctagon, color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' };
      case 'CUSTOMER_ACCEPTED':
        return { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' };
      case 'CUSTOMER_REOPENED':
        return { icon: AlertOctagon, color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' };
      default:
        return { icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/80' };
    }
  };

  return (
    <div className="timeline-wrapper space-y-4">
      {history.map((item, index) => {
        const { icon: Icon, color } = getActionConfig(item.action);
        const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short'
        }) : '';

        return (
          <div key={index} className="timeline-node flex gap-3.5 relative">
            {/* Connecting vertical line */}
            {index < history.length - 1 && (
              <div className="timeline-line absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-800" />
            )}

            <div className={`timeline-icon-box z-10 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${color}`}>
              <Icon size={15} />
            </div>

            <div className="timeline-content pb-4 flex-1 min-width-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="font-semibold text-xs text-slate-100 tracking-wide uppercase">
                  {item.action ? item.action.replace('_', ' ') : 'EVENT'}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {dateStr}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
              {item.by && (
                <span className="text-[11px] text-slate-400 font-medium inline-block mt-1">
                  by {item.by.name || 'System User'} <span className="text-slate-500">({item.by.role || 'user'})</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
