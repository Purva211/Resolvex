import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { ShieldCheck, PieChart as PieIcon, BarChart2, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
  New: '#0284c7',        // Sky
  Assigned: '#8b5cf6',   // Purple
  'In Progress': '#f59e0b', // Amber
  Resolved: '#10b981',   // Emerald
  Closed: '#64748b',     // Slate
  Reopened: '#f43f5e'    // Rose
};

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export function AnalyticsCharts({ data, role = 'admin' }) {
  if (!data) return null;

  // Format Status Data for Donut Chart
  const statusData = [
    { name: 'New', value: data.open || 0 },
    { name: 'Assigned', value: data.assigned || 0 },
    { name: 'In Progress', value: data.investigating || 0 },
    { name: 'Resolved', value: data.resolved || 0 },
    { name: 'Closed', value: data.closed || 0 },
    { name: 'Reopened', value: data.reopened || 0 }
  ].filter(item => item.value > 0);

  // Format Trend Data
  const trendData = (data.trends || []).map(t => ({
    date: t._id ? t._id.slice(5) : 'Date',
    complaints: t.count || 0
  }));

  // Format Category Data
  const categoryData = (data.categories || []).map(c => ({
    category: c.category || 'Other',
    count: c.count || 0,
    percentage: c.percentage || 0
  }));

  // SLA Health percentages
  const sla = data.sla || { within: 0, dueSoon: 0, breached: 0, total: 0 };
  const totalSla = sla.total || (sla.within + sla.dueSoon + sla.breached) || 1;
  const withinPct = Math.round((sla.within / totalSla) * 100);
  const dueSoonPct = Math.round((sla.dueSoon / totalSla) * 100);
  const breachedPct = Math.round((sla.breached / totalSla) * 100);

  return (
    <div className="analytics-section space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-400" />
              <h3 className="chart-title text-slate-100">Complaint Activity Trends</h3>
            </div>
            <span className="text-xs text-slate-400">Last 14 Days</span>
          </div>

          <div className="h-64 w-full pt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="complaints" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
            )}
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="flex items-center gap-2">
              <PieIcon size={18} className="text-indigo-400" />
              <h3 className="chart-title text-slate-100">Status Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Current Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative pt-2">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">No complaints to display</div>
            )}

            {/* Legend */}
            <div className="absolute bottom-1 left-0 right-0 flex flex-wrap justify-center gap-3 text-xs">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="text-slate-500">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="chart-card lg:col-span-2">
          <div className="chart-card-header">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-400" />
              <h3 className="chart-title text-slate-100">Complaints by Category</h3>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 12, fill: '#cbd5e1' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No category data</div>
            )}
          </div>
        </div>

        {/* SLA Health Indicator */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-400" />
              <h3 className="chart-title text-slate-100">SLA Compliance Health</h3>
            </div>
          </div>

          <div className="sla-health-widget py-2">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-400">Within SLA</span>
                  <span className="text-emerald-400">{withinPct}% ({sla.within})</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${withinPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-400">Due Soon (&lt;24h)</span>
                  <span className="text-amber-400">{dueSoonPct}% ({sla.dueSoon})</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dueSoonPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-400">SLA Breached</span>
                  <span className="text-rose-400">{breachedPct}% ({sla.breached})</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${breachedPct}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-400">
              <p>SLA SLAs auto-monitored. Critical complaints breach after 8h, High after 24h.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
