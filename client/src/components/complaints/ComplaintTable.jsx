import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, User, Calendar, Tag } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { SLAIndicator } from '../common/SLAIndicator';
import { EmptyState } from '../common/EmptyState';

export default function ComplaintTable({ items = [] }) {
  if (!items.length) {
    return <EmptyState title="No complaints found" description="No complaints match the specified search or filter criteria." />;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="table-container hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>ID</th>
              <th style={{ minWidth: '220px' }}>Title</th>
              <th style={{ width: '130px' }}>Category</th>
              <th style={{ width: '120px' }}>Priority</th>
              <th style={{ width: '150px' }}>Assigned Agent</th>
              <th style={{ width: '160px' }}>SLA Status</th>
              <th style={{ width: '130px' }}>Status</th>
              <th style={{ width: '90px' }} className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="table-row">
                <td className="font-semibold text-indigo-400 font-mono text-xs whitespace-nowrap">
                  {c.complaintId}
                </td>
                <td className="cell-title" title={c.title}>
                  <div className="font-medium text-slate-100 truncate max-w-[260px]">
                    {c.title}
                  </div>
                  {c.customer?.name && (
                    <span className="text-[11px] text-slate-400 block truncate max-w-[260px]">
                      by {c.customer.name}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  <span className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded-md font-medium inline-block">
                    {c.category}
                  </span>
                </td>
                <td className="whitespace-nowrap">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <User size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{c.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <SLAIndicator complaint={c} />
                </td>
                <td className="whitespace-nowrap">
                  <StatusBadge status={c.status} />
                </td>
                <td className="text-right whitespace-nowrap">
                  <Link 
                    to={`/complaints/${c._id}`} 
                    className="btn-table-action"
                    title="View Complaint Details"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((c) => (
          <div key={c._id} className="complaint-card-mobile">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs font-bold text-indigo-400">{c.complaintId}</span>
              <PriorityBadge priority={c.priority} />
            </div>

            <h4 className="font-semibold text-slate-100 text-sm mb-1 line-clamp-2 leading-snug">{c.title}</h4>

            {c.customer?.name && (
              <span className="text-xs text-slate-400 block mb-2">Customer: {c.customer.name}</span>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={c.status} />
              <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded">{c.category}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2.5 border-t border-slate-800">
              <SLAIndicator complaint={c} />
              <Link 
                to={`/complaints/${c._id}`} 
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <Eye size={13} />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
