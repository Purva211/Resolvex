import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  const colorClasses = {
    blue: 'border-blue-200 text-blue-600 bg-blue-50/50',
    amber: 'border-amber-200 text-amber-600 bg-amber-50/50',
    purple: 'border-purple-200 text-purple-600 bg-purple-50/50',
    emerald: 'border-emerald-200 text-emerald-600 bg-emerald-50/50',
    rose: 'border-rose-200 text-rose-600 bg-rose-50/50',
    slate: 'border-slate-200 text-slate-600 bg-slate-50/50'
  };

  const badgeColor = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`stat-card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon ${badgeColor}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <span className="stat-card-value">{value ?? 0}</span>
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
