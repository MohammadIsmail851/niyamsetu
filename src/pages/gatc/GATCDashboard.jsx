import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, PageHeader, DataTable, StatusBadge } from '@/components/shared';
import { Package, FileText, CheckCircle, Clock, Upload, Eye } from 'lucide-react';
import { MOCK_APPLICATIONS } from '@/data/mockData';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store';

const GATCDashboard = () => {
  const { profile } = useAuthStore();
  const assigned = MOCK_APPLICATIONS.filter(a => a.status === 'assigned');

  const columns = [
    { key: 'applicationId', label: 'App ID', render: r => <span className="font-mono text-xs text-royal">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'serialNumber',   label: 'Serial No.' },
    { key: 'ownerName',      label: 'Owner' },
    { key: 'submittedAt',    label: 'Received', render: r => <span className="text-xs">{formatDate(r.submittedAt)}</span> },
    { key: 'status',         label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <div className="flex gap-2">
          <Link to={`/gatc/tests/${r.id}`} className="btn btn-primary btn-sm text-xs">
            Enter Results
          </Link>
        </div>
      ),
    },
  ];

  const testData = [
    { id: 1, app: 'NS-APP-2026-001250', inst: 'Analytical Balance', measurements: '3 tests', result: 'Pass', progress: 100 },
    { id: 2, app: 'NS-APP-2026-001251', inst: 'Spring Balance 50kg', measurements: '1 test',  result: 'Pending', progress: 33 },
    { id: 3, app: 'NS-APP-2026-001252', inst: 'Platform Scale 200kg', measurements: '2 tests', result: 'In Progress', progress: 66 },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="GATC Laboratory Dashboard"
        subtitle={`${profile?.name || 'Lab'} — Government Approved Test Centre`}
        breadcrumbs={['Home', 'Dashboard']}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package}     label="Assigned Tests"    value={assigned.length + 3} color="navy" />
        <StatCard icon={Clock}       label="In Progress"       value={2}                   color="amber" />
        <StatCard icon={CheckCircle} label="Tests Completed"   value={7}                   color="green" />
        <StatCard icon={FileText}    label="Reports Uploaded"  value={5}                   color="blue" />
      </div>

      {/* Active Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Active Laboratory Tests</h2>
          <div className="space-y-3">
            {testData.map(test => (
              <div key={test.id} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{test.inst}</div>
                    <div className="text-xs font-mono text-royal">{test.app}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    test.result === 'Pass' ? 'bg-green-100 text-green-700' :
                    test.result === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{test.result}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 bg-royal rounded-full" style={{ width: `${test.progress}%` }} />
                  </div>
                  <span className="text-xs text-slate">{test.progress}%</span>
                </div>
                <div className="text-xs text-slate mt-1">{test.measurements} completed</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { icon: Package,   label: 'Enter Test Measurements', sub: 'Record laboratory observations', to: '/gatc/tests' },
              { icon: Upload,    label: 'Upload Test Report',       sub: 'Submit signed PDF report',       to: '/gatc/reports' },
              { icon: CheckCircle, label: 'Approve Test Result',    sub: 'Mark as approved / failed',      to: '/gatc/tests' },
              { icon: Eye,       label: 'View All Assignments',     sub: 'See all allocated test cases',   to: '/gatc/tests' },
            ].map(({ icon: Icon, label, sub, to }) => (
              <Link key={label} to={to} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-royal hover:bg-blue-50/20 transition-all">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-royal" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{label}</div>
                  <div className="text-xs text-slate">{sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Applications Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Assigned for Laboratory Verification</h2>
        </div>
        <DataTable columns={columns} data={MOCK_APPLICATIONS.slice(0, 2)} emptyMessage="No tests assigned yet" />
      </div>
    </DashboardLayout>
  );
};

export default GATCDashboard;
