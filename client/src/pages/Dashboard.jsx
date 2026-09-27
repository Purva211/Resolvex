import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CheckCheck, 
  PlusCircle, 
  TrendingUp, 
  RefreshCw,
  Zap,
  RotateCcw,
  Download
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/dashboard/StatCard';
import { SLAAttentionBanner } from '../components/dashboard/SLAAttentionBanner';
import { AnalyticsCharts } from '../components/dashboard/AnalyticsCharts';
import ComplaintTable from '../components/complaints/ComplaintTable';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { ReportExportModal } from '../components/common/ReportExportModal';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [dashRes, complaintsRes] = await Promise.all([
        api.get('/complaints/dashboard'),
        api.get('/complaints')
      ]);
      setData(dashRes.data);
      const list = Array.isArray(complaintsRes.data) ? complaintsRes.data : [];
      setAllComplaints(list);
      setRecentComplaints(list.slice(0, 5));
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load dashboard information');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-800/60 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <h3 className="font-bold text-rose-300 text-sm">Failed to load Dashboard</h3>
        <p className="text-xs text-rose-200 mt-1">{error}</p>
        <button onClick={loadDashboard} className="btn btn-secondary btn-sm mt-3 flex items-center gap-1.5">
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const d = data || {};
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  return (
    <div className="dashboard-page space-y-6">
      {/* Welcome Banner & Export Actions */}
      <div className="dashboard-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            {getGreeting()}, {user?.name || 'User'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin 
              ? "Here is what's happening across the ResolveX platform today."
              : isAgent 
              ? "Here are your assigned complaints and SLA statuses."
              : "Track your filed complaints and resolution progress."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary flex items-center gap-2 text-xs"
          >
            <Download size={15} />
            <span>📊 Generate Report</span>
          </button>

          {user?.role === 'customer' && (
            <button 
              onClick={() => navigate('/complaints/new')}
              className="btn btn-primary flex items-center gap-2 text-xs"
            >
              <PlusCircle size={15} />
              <span>New Complaint</span>
            </button>
          )}
        </div>
      </div>

      {/* SLA Attention Banner */}
      <SLAAttentionBanner 
        breachedCount={d.breached || 0} 
        dueSoonCount={d.dueSoon || 0} 
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Complaints"
          value={d.total || 0}
          subtitle="All time record"
          icon={FileText}
          color="blue"
          onClick={() => navigate('/complaints')}
        />

        <StatCard
          title="Open"
          value={d.open || 0}
          subtitle="Awaiting triage"
          icon={Clock}
          color="blue"
          onClick={() => navigate('/complaints?status=NEW')}
        />

        <StatCard
          title="In Progress"
          value={(d.assigned || 0) + (d.investigating || 0)}
          subtitle="Active investigation"
          icon={Zap}
          color="amber"
          onClick={() => navigate('/complaints?status=IN_PROGRESS')}
        />

        <StatCard
          title="Resolved"
          value={d.resolved || 0}
          subtitle="Pending customer review"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/complaints?status=RESOLVED')}
        />

        <StatCard
          title="Closed"
          value={d.closed || 0}
          subtitle="Completed resolution"
          icon={CheckCheck}
          color="slate"
          onClick={() => navigate('/complaints?status=CLOSED')}
        />

        <StatCard
          title="SLA Breached"
          value={d.breached || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color={d.breached > 0 ? "rose" : "slate"}
          onClick={() => navigate('/complaints?priority=CRITICAL')}
        />
      </div>

      {/* Role Analytics & Charts */}
      {isAdmin ? (
        <AnalyticsCharts data={d} role={user?.role} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-slate-100 text-sm mb-3">SLA Status Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-800/60">
                <span className="block text-2xl font-bold text-amber-400">{d.dueSoon || 0}</span>
                <span className="text-xs text-amber-300 font-medium">Due within 24 Hours</span>
              </div>
              <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-800/60">
                <span className="block text-2xl font-bold text-rose-400">{d.breached || 0}</span>
                <span className="text-xs text-rose-300 font-medium">Currently Breached</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-slate-100 text-sm mb-2">AI Decision Support</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              ResolveX uses AI classification models to evaluate category, priority and SLA timeframes upon submission. Support personnel retain full authority to adjust classification.
            </p>
          </div>
        </div>
      )}

      {/* Recent Complaints Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 pb-1">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Recent Complaints</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest active complaint submissions</p>
          </div>
          <button 
            onClick={() => navigate('/complaints')} 
            className="btn btn-ghost text-xs text-indigo-400 font-semibold hover:bg-slate-800 px-3 py-1.5"
          >
            View All Complaints →
          </button>
        </div>

        <ComplaintTable items={recentComplaints} />
      </div>

      {/* Report Generation Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        complaints={allComplaints}
      />
    </div>
  );
}
