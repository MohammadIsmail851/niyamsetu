import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Eye, FileText, Edit } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { MOCK_INSTRUMENTS } from '@/data/mockData';

const InstrumentsListPage = () => {
  const instruments = MOCK_INSTRUMENTS;

  const columns = [
    { key: 'instrumentType', label: 'Instrument Type' },
    { key: 'serialNumber',   label: 'Serial Number' },
    { key: 'manufacturer',   label: 'Manufacturer' },
    { key: 'capacity',       label: 'Capacity' },
    { key: 'district',       label: 'District' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className="badge badge-verified">Active</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/owner/instruments/${row.id}`} className="btn btn-ghost btn-sm p-1.5">
            <Eye size={14} />
          </Link>
          <Link to={`/owner/applications/new?instrument=${row.id}`} className="btn btn-primary btn-sm">
            Apply
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Instruments"
        subtitle="Manage your registered weighing and measuring instruments"
        breadcrumbs={['Dashboard', 'Instruments']}
        actions={
          <Link to="/owner/instruments/register" className="btn btn-primary">
            <Plus size={16} /> Register Instrument
          </Link>
        }
      />

      <div className="card p-0 overflow-hidden">
        <DataTable
          columns={columns}
          data={instruments}
          emptyMessage="No instruments registered yet"
        />
      </div>
    </DashboardLayout>
  );
};

export default InstrumentsListPage;
