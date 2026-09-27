import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { MOCK_APPLICATIONS } from '@/data/mockData';
import { formatDate } from '@/utils';

const ApplicationsListPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = MOCK_APPLICATIONS.filter(a => {
    const matchSearch = !search || a.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      a.instrumentType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'applicationId', label: 'Application ID', render: r => <span className="font-mono font-medium text-royal text-xs">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'verificationType', label: 'Type', render: r => <span className="capitalize">{r.verificationType?.replace('_', ' ')}</span> },
    { key: 'submittedAt', label: 'Submitted', render: r => <span className="text-xs text-slate">{formatDate(r.submittedAt)}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <Link to={`/owner/applications/${r.id}`} className="btn btn-ghost btn-sm text-xs">View</Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Applications"
        subtitle="Track all your verification applications"
        breadcrumbs={['Dashboard', 'Applications']}
        actions={
          <Link to="/owner/applications/new" className="btn btn-primary">New Application</Link>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="form-input pl-9 text-sm"
            placeholder="Search by ID or instrument type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input w-auto text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['draft','submitted','assigned','scheduled','inspection_completed','verified','certificate_generated','expired'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No applications found"
        />
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsListPage;
