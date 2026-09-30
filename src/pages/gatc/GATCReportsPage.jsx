import { useState, useEffect } from 'react';
import { FileText, CheckCircle, FlaskConical } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';

const GATCReportsPage = () => {
  const { user, profile } = useAuthStore();
  const gatcId = user?.uid || profile?.uid;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gatcId) { setLoading(false); return; }
    setLoading(true);

    const q = query(
      collection(db, 'laboratoryReports'),
      where('gatcId', '==', gatcId),
    );

    const unsub = onSnapshot(
      q,
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setReports(list);
        setLoading(false);
      },
      err => {
        console.error('[GATCReportsPage]', err);
        // fallback — fetch all
        onSnapshot(collection(db, 'laboratoryReports'), snap2 => {
          const all = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
          setReports(all.filter(r => r.gatcId === gatcId));
          setLoading(false);
        }, () => { setReports([]); setLoading(false); });
      }
    );

    return () => unsub();
  }, [gatcId]);

  const columns = [
    {
      key: 'applicationId', label: 'Application',
      render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.applicationId || r.id?.slice(0, 8)}</span>,
    },
    { key: 'standardReference', label: 'Standard Used' },
    { key: 'accuracyVerification', label: 'Accuracy Verified' },
    {
      key: 'reportStatus', label: 'Result',
      render: r => (
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          r.reportStatus === 'PASS'
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-400/30'
            : 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-400/30'
        }`}>
          {r.reportStatus || '—'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Submitted',
      render: r => <span className="text-xs text-slate-500 dark:text-white/60">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'remarks', label: 'Remarks',
      render: r => <span className="text-xs text-slate-600 dark:text-white/70 max-w-[180px] truncate block">{r.remarks || '—'}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Submitted Reports"
        subtitle="All laboratory test reports submitted by your centre"
        breadcrumbs={['Dashboard', 'Reports']}
      />

      <div className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {reports.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState
              icon={FileText}
              title="No reports submitted yet"
              description="Laboratory reports submitted for assigned applications will appear here."
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={reports}
            loading={loading}
            emptyMessage="No reports found"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default GATCReportsPage;
