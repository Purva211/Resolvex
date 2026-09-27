import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, RefreshCw, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComplaintTable from '../components/complaints/ComplaintTable';
import { ComplaintFilterBar } from '../components/complaints/ComplaintFilterBar';
import { SkeletonTable } from '../components/common/Skeleton';
import { ReportExportModal } from '../components/common/ReportExportModal';

export default function Complaints() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter States initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All Statuses');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'All Priorities');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');

  async function fetchComplaints() {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/complaints');
      setItems(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load complaints');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Update URL search params on filter change
  useEffect(() => {
    const params = {};
    if (search) params.q = search;
    if (status !== 'All Statuses') params.status = status;
    if (priority !== 'All Priorities') params.priority = priority;
    if (category !== 'All Categories') params.category = category;
    setSearchParams(params, { replace: true });
  }, [search, status, priority, category]);

  // Client-side Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search text match
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesId = item.complaintId?.toLowerCase().includes(query);
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesCustomer = item.customer?.name?.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesCustomer) return false;
      }

      // Status match
      if (status !== 'All Statuses' && item.status !== status) return false;

      // Priority match
      if (priority !== 'All Priorities' && item.priority !== priority) return false;

      // Category match
      if (category !== 'All Categories' && item.category !== category) return false;

      return true;
    });
  }, [items, search, status, priority, category]);

  function handleResetFilters() {
    setSearch('');
    setStatus('All Statuses');
    setPriority('All Priorities');
    setCategory('All Categories');
  }

  return (
    <div className="complaints-page space-y-6">
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Complaints</h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'admin'
              ? 'Complete list of system complaints and support tickets'
              : user?.role === 'agent'
              ? 'Complaints currently assigned to your queue'
              : 'Your filed customer complaint tickets'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary flex items-center gap-2 text-xs"
          >
            <Download size={15} />
            <span>📊 Export Report</span>
          </button>

          {user?.role === 'customer' && (
            <Link to="/complaints/new" className="btn btn-primary flex items-center gap-2 text-xs">
              <PlusCircle size={15} />
              <span>New Complaint</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <ComplaintFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
        onReset={handleResetFilters}
      />

      {/* Main Content / Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : error ? (
        <div className="error-card">
          <p className="text-xs text-rose-300">{error}</p>
          <button onClick={fetchComplaints} className="btn btn-secondary btn-sm mt-3 flex items-center gap-1.5">
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <ComplaintTable items={filteredItems} />
      )}

      {/* Report Export Modal */}
      <ReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        complaints={filteredItems}
      />
    </div>
  );
}
