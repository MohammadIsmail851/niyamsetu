import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Plus } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store';

const ApplicationsListPage = () => {
  const { profile } = useAuthStore();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const ownerId = profile?.uid;
    if (!ownerId) { setLoading(false); return; }
    setLoading(true);
    const q = query(
      collection(db, 'applications'),
      where('ownerId', '==', ownerId),
    );
    const unsub = onSnapshot(
      q,
      snap => { setApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => { setApps([]); setLoading(false); },
    );
    return () => unsub();
  }, [profile?.uid]);

  const filtered = apps.filter(a => {
    const matchSearch = !search ||
      (a.applicationId || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.instrumentType || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'applicationId', label: 'Application ID', render: r => <span className="font-mono font-semibold text-blue-600 dark:text-blue-300 text-xs">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'verificationType', label: 'Type', render: r => <span className="capitalize text-slate-700 dark:text-white/80">{r.verificationType?.replace('_', ' ')}</span> },
    { key: 'submittedAt', label: 'Submitted', render: r => <span className="text-xs text-slate-500 dark:text-white/60">{formatDate(r.submittedAt)}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <Link
          to={`/owner/applications/${r.id}`}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/15 text-xs text-slate-800 dark:text-white font-medium transition-all"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Applications"
        subtitle="Track and manage all statutory verification applications"
        breadcrumbs={['Dashboard', 'Applications']}
        actions={
          <Link
            to="/owner/applications/new"
            className="h-[46px] px-5 rounded-xl font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            <Plus size={16} />
            <span>New Application</span>
          </Link>
        }
      />

      {/* Filters with 52px height and fixed input/icon alignment */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
          <input
            className="w-full h-[52px] rounded-xl pl-[48px] pr-4 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
            placeholder="Search by Application ID or instrument type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-[52px] px-4 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['draft','submitted','assigned','scheduled','inspection_completed','verified','certificate_generated','expired'].map(s => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Glassmorphic Data Table Card */}
      <div
        className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        {apps.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No applications submitted yet"
              description="Your verification applications will appear here after submission."
              action={
                <Link
                  to="/owner/applications/new"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Submit Application</span>
                </Link>
              }
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            loading={loading}
            emptyMessage="No applications match your search"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsListPage;
