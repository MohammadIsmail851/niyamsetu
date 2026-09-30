import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Plus } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';

const GATCTestsPage = () => {
  const { user, profile } = useAuthStore();
  const gatcId = user?.uid || profile?.uid;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gatcId) { setLoading(false); return; }
    setLoading(true);

    // Show apps assigned to this GATC lab; also show all if no specific filter yet
    const q = query(
      collection(db, 'applications'),
      where('assignedGATCId', '==', gatcId),
    );

    const unsub = onSnapshot(
      q,
      snap => {
        setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => {
        console.error('[GATCTestsPage]', err);
        // Fallback: fetch all apps that have this GATC or are assigned
        const fallbackQ = query(collection(db, 'applications'));
        onSnapshot(fallbackQ, snap2 => {
          const all = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
          setApplications(all.filter(a =>
            a.assignedGATCId === gatcId ||
            ['assigned', 'scheduled', 'inspection_in_progress'].includes(a.status)
          ));
          setLoading(false);
        }, () => { setApplications([]); setLoading(false); });
      }
    );

    return () => unsub();
  }, [gatcId]);

  const columns = [
    {
      key: 'applicationId', label: 'App ID',
      render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.applicationId || r.id?.slice(0, 8)}</span>,
    },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'serialNumber',   label: 'Serial No.' },
    { key: 'ownerName',      label: 'Owner' },
    { key: 'district',       label: 'District' },
    {
      key: 'submittedAt', label: 'Assigned On',
      render: r => <span className="text-xs text-slate-500 dark:text-white/60">{formatDate(r.submittedAt)}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: r => <StatusBadge status={r.status} />,
    },
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
        title="Assigned Laboratory Tests"
        subtitle="Instruments assigned for pattern approval and precision testing"
        breadcrumbs={['Dashboard', 'Tests']}
      />

      <div className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {applications.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState
              icon={FlaskConical}
              title="No tests assigned yet"
              description="Applications assigned to your laboratory will appear here for processing."
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={applications}
            loading={loading}
            emptyMessage="No assigned tests"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GATCTestsPage;
