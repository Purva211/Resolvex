import React from 'react';

export function SkeletonCard() {
  return (
    <div className="card skeleton-card animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="table-wrap animate-pulse">
      <div className="h-10 bg-slate-100 border-b border-slate-200"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-48"></div>
          <div className="h-4 bg-slate-100 rounded w-24"></div>
          <div className="h-4 bg-slate-100 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}
