import { useState, useEffect } from 'react';
import { FileText, Loader } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { formatDate } from '@/utils';
import toast from 'react-hot-toast';

const AdminApplicationsPage = () => {
  const [apps,       setApps]       = useState([]);
  const [officers,   setOfficers]   = useState([]);
  const [gatcLabs,   setGatcLabs]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [assigning,  setAssigning]  = useState(null);

  // Modal state
  const [modalApp,      setModalApp]      = useState(null);
  const [selOfficerId,  setSelOfficerId]  = useState('');
  const [selGATCId,     setSelGATCId]     = useState('');
  const [saving,        setSaving]        = useState(false);

  useEffect(() => {
    // Real-time applications
    const unsub = onSnapshot(
      collection(db, 'applications'),
      snap => { setApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => { setApps([]); setLoading(false); }
    );

    // Fetch users once (for officer/GATC dropdowns)
    getDocs(collection(db, 'users')).then(snap => {
      const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOfficers(allUsers.filter(u => u.role === 'lmo'));
      setGatcLabs(allUsers.filter(u => u.role === 'gatc'));
    }).catch(() => {});

    return () => unsub();
  }, []);

  const handleSaveAssignment = async () => {
    if (!modalApp) return;
    setSaving(true);
    try {
      const officer = officers.find(o => o.id === selOfficerId || o.uid === selOfficerId);
      const gatc    = gatcLabs.find(g => g.id === selGATCId    || g.uid === selGATCId);

      const updates = {
        status:    'assigned',
        updatedAt: serverTimestamp(),
      };
      if (officer) {
        updates.assignedOfficerId   = selOfficerId;
        updates.assignedOfficerName = officer.name || officer.email;
      }
      if (gatc) {
        updates.assignedGATCId   = selGATCId;
        updates.assignedGATCName = gatc.name || gatc.email;
      }

      await updateDoc(doc(db, 'applications', modalApp.id), updates);
      toast.success('Assignment saved successfully!');
      setModalApp(null);
    } catch (err) {
      console.error('[AdminApplications] assign error:', err);
      toast.error('Failed to save assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'applicationId', label: 'App ID',
      render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.applicationId || r.id?.slice(0, 8)}</span>,
    },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'ownerName',      label: 'Owner' },
    { key: 'district',       label: 'District' },
    {
      key: 'submittedAt', label: 'Submitted',
      render: r => <span className="text-xs text-slate-500 dark:text-white/60">{formatDate(r.submittedAt)}</span>,
    },
    { key: 'assignedOfficerName', label: 'Officer',
      render: r => <span className="text-xs text-slate-600 dark:text-white/70">{r.assignedOfficerName || '—'}</span>,
    },
    { key: 'assignedGATCName', label: 'GATC Lab',
      render: r => <span className="text-xs text-slate-600 dark:text-white/70">{r.assignedGATCName || '—'}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: r => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions', label: 'Action',
      render: r => (
        <button
          onClick={() => { setModalApp(r); setSelOfficerId(r.assignedOfficerId || ''); setSelGATCId(r.assignedGATCId || ''); }}
          className="px-3 py-1.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 hover:bg-blue-600 border border-blue-500/20 dark:border-blue-400/40 text-xs font-semibold text-blue-700 dark:text-white hover:text-white transition-all cursor-pointer"
        >
          Assign
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Verification Applications"
        subtitle="Manage and assign all submitted verification applications"
        breadcrumbs={['Home', 'Applications']}
      />

      <div className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {apps.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState icon={FileText} title="No applications yet" description="Submitted applications will appear here." />
          </div>
        ) : (
          <DataTable columns={columns} data={apps} loading={loading} emptyMessage="No applications found" />
        )}
      </div>

      {/* Assignment Modal */}
      {modalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-[#04142F]/70 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-[28px] bg-white dark:bg-[#04142F] border border-slate-200 dark:border-white/15 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Assign Application
            </h3>
            <div className="text-xs text-slate-500 dark:text-white/50 font-mono">
              {modalApp.applicationId || modalApp.id?.slice(0, 8)} — {modalApp.instrumentType}
            </div>

            {/* Officer selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                Assign LM Officer
              </label>
              <select
                value={selOfficerId}
                onChange={e => setSelOfficerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">— Select Officer —</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>{o.name || o.email}</option>
                ))}
                {officers.length === 0 && (
                  <option disabled>No LM Officers in system</option>
                )}
              </select>
            </div>

            {/* GATC selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                Assign GATC Laboratory
              </label>
              <select
                value={selGATCId}
                onChange={e => setSelGATCId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="">— Select GATC Lab —</option>
                {gatcLabs.map(g => (
                  <option key={g.id} value={g.id}>{g.name || g.email}</option>
                ))}
                {gatcLabs.length === 0 && (
                  <option disabled>No GATC labs in system</option>
                )}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalApp(null)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-slate-700 dark:text-white/70 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssignment}
                disabled={saving}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {saving ? <><Loader size={14} className="animate-spin" />Saving...</> : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminApplicationsPage;
