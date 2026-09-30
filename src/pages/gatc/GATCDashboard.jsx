import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { Package, FileText, CheckCircle, Clock, FlaskConical } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { formatDate } from '@/utils';
import { useAuthStore } from '@/store';

const GATCDashboard = () => {
  const { profile } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const appsCol = collection(db, 'applications');
    const unsubscribe = onSnapshot(
      appsCol,
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(apps);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching applications for GATC:', error);
        setApplications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const assignedTests = applications.filter(a => a.status === 'assigned' || a.status === 'scheduled');
  const inTesting = applications.filter(a => a.status === 'inspection_in_progress');
  const testsCompleted = applications.filter(a => a.status === 'inspection_completed' || a.status === 'certificate_generated');
  const reportsUploaded = applications.filter(a => a.status === 'certificate_generated');

  const columns = [
    { key: 'applicationId', label: 'App ID', render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'serialNumber',   label: 'Serial No.' },
    { key: 'ownerName',      label: 'Owner' },
    { key: 'submittedAt',    label: 'Received', render: r => <span className="text-xs text-slate-500 dark:text-white/70">{formatDate(r.submittedAt)}</span> },
    { key: 'status',         label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: r => (
        <Link
          to={`/gatc/tests/${r.id}`}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 hover:bg-blue-600 border border-blue-500/20 dark:border-blue-400/40 text-xs font-semibold text-blue-700 dark:text-white hover:text-white transition-all inline-block"
        >
          Enter Results
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="GATC Laboratory Dashboard"
        subtitle={`${profile?.name || 'Laboratory Test Centre'} — Government Approved Test Centre`}
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Dynamic Firestore Metrics Grid (Real counts only, 0 if empty) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package}     label="Assigned Tests"   value={assignedTests.length} color="navy" />
        <StatCard icon={Clock}       label="In Testing"       value={inTesting.length}     color="amber" />
        <StatCard icon={CheckCircle} label="Tests Completed"  value={testsCompleted.length} color="green" />
        <StatCard icon={FileText}    label="Reports Uploaded" value={reportsUploaded.length} color="blue" />
      </div>

      {/* Active Tests Glass Card */}
      <div
        className="rounded-[28px] p-6 mb-6 transition-all duration-200 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4">Laboratory Verification Tasks</h2>
        {assignedTests.length === 0 && !loading ? (
          <EmptyState
            icon={FlaskConical}
            title="No laboratory tests assigned yet"
            description="Instruments requiring specialized pattern testing or precision calibration will appear here."
          />
        ) : (
          <DataTable
            columns={columns}
            data={assignedTests}
            loading={loading}
            emptyMessage="No tests assigned yet"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GATCDashboard;
