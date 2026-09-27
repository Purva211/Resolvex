import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const CATEGORIES = ['All Categories', 'Payment', 'Technical', 'Delivery', 'Product', 'Account', 'Service', 'Other'];
const PRIORITIES = ['All Priorities', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['All Statuses', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'REOPENED', 'CLOSED'];

export function ComplaintFilterBar({ 
  search, 
  onSearchChange, 
  status, 
  onStatusChange, 
  priority, 
  onPriorityChange, 
  category, 
  onCategoryChange,
  onReset
}) {
  const hasActiveFilters = search || status !== 'All Statuses' || priority !== 'All Priorities' || category !== 'All Categories';

  return (
    <div className="filter-bar-card">
      <div className="filter-bar-grid">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, title, text..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Status Dropdown */}
        <select 
          value={status} 
          onChange={(e) => onStatusChange(e.target.value)}
          className="select-field"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Priority Dropdown */}
        <select 
          value={priority} 
          onChange={(e) => onPriorityChange(e.target.value)}
          className="select-field"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Category Dropdown */}
        <select 
          value={category} 
          onChange={(e) => onCategoryChange(e.target.value)}
          className="select-field"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button 
            onClick={onReset}
            className="btn btn-ghost text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1"
            title="Reset filters"
          >
            <X size={14} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
