import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Eye, Trash2, Loader } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import {
  collection, query, where, onSnapshot, deleteDoc, doc, orderBy
} from 'firebase/firestore';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const InstrumentsListPage = () => {
  const { profile, user } = useAuthStore();
  const ownerId = user?.uid || profile?.uid;

  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [indexNotice, setIndexNotice] = useState('');

  // ── Real-time Firestore listener ─────────────────────────────────────────
  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setIndexNotice('');

    const q = query(
      collection(db, 'instruments'),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    );

    let fallbackUnsub = null;

    const unsub = onSnapshot(
      q,
      snap => {
        setInstruments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setIndexNotice('');
      },
      err => {
        console.error('[InstrumentsListPage] onSnapshot error:', err);
        const isIndexErr = err?.code === 'failed-precondition' || err?.message?.toLowerCase().includes('index');
        if (isIndexErr) {
          setIndexNotice('Creating database index... Please create the Firestore index.');
          toast.error('Creating database index... Please create the Firestore index.', { duration: 6000 });
        }

        // Fallback: fetch without composite orderBy, sort in-memory newest-first
        const fallbackQ = query(
          collection(db, 'instruments'),
          where('ownerId', '==', ownerId),
        );
        fallbackUnsub = onSnapshot(
          fallbackQ,
          snap2 => {
            const list = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => {
              const tA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
              const tB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
              return tB - tA;
            });
            setInstruments(list);
            setLoading(false);
          },
          err2 => {
            console.error('[InstrumentsListPage] fallback query error:', err2);
            setInstruments([]);
            setLoading(false);
          }
        );
      },
    );

    return () => {
      unsub();
      if (fallbackUnsub) fallbackUnsub();
    };
  }, [ownerId]);

  // ── Delete instrument ───────────────────────────────────────────────────
  const handleDelete = async (inst) => {
    if (!window.confirm(`Delete "${inst.instrumentType} — SN: ${inst.serialNumber}"? This cannot be undone.`)) return;
    setDeleting(inst.id);
    try {
      await deleteDoc(doc(db, 'instruments', inst.id));
      toast.success('Instrument deleted successfully.');
    } catch (err) {
      console.error('[InstrumentsListPage] delete error:', err);
      toast.error('Delete failed. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { key: 'instrumentType', label: 'Instrument Type' },
    {
      key: 'serialNumber',
      label: 'Serial Number',
      render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.serialNumber}</span>,
    },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'capacity',     label: 'Capacity' },
    { key: 'district',     label: 'District' },
    {
      key: 'status',
      label: 'Status',
      render: r => (
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
          {r.status || 'Registered'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <Link
            to={`/owner/instruments/${row.id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all"
            title="View Details"
          >
            <Eye size={14} />
          </Link>
          <Link
            to={`/owner/applications/new?instrument=${row.id}`}
            className="px-3 py-1.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 hover:bg-blue-600 border border-blue-500/20 dark:border-blue-400/40 text-xs font-semibold text-blue-700 dark:text-white hover:text-white transition-all"
          >
            Apply
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={deleting === row.id}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 dark:bg-rose-500/15 dark:hover:bg-rose-500 border border-rose-400/30 text-rose-600 dark:text-rose-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Delete Instrument"
          >
            {deleting === row.id
              ? <Loader size={14} className="animate-spin" />
              : <Trash2 size={14} />
            }
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Instruments"
        subtitle="Manage and view your registered weighing and measuring instruments"
        breadcrumbs={['Dashboard', 'Instruments']}
        actions={
          <Link
            to="/owner/instruments/register"
            className="h-[46px] px-5 rounded-xl font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            <Plus size={16} />
            <span>Register Instrument</span>
          </Link>
        }
      />

      {indexNotice && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <span>{indexNotice}</span>
        </div>
      )}

      <div className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {instruments.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="No instruments registered yet"
              description="Register your weighing or measuring instruments to begin statutory verification."
              action={
                <Link
                  to="/owner/instruments/register"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Register Instrument</span>
                </Link>
              }
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={instruments}
            loading={loading}
            emptyMessage="No instruments registered yet"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstrumentsListPage;
