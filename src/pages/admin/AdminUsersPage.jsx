import { useState, useEffect } from 'react';
import { Users, Loader, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, DataTable, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { formatDate } from '@/utils';
import toast from 'react-hot-toast';

const ROLE_LABELS = {
  business_owner: 'Business Owner',
  lmo:            'LM Officer',
  gatc:           'GATC Lab',
  admin:          'Administrator',
};

const AdminUsersPage = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setUsers(list);
        setLoading(false);
      },
      err => {
        console.error('[AdminUsersPage]', err);
        setUsers([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleToggleActive = async (u) => {
    setToggling(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), {
        isActive:  !u.isActive,
        updatedAt: serverTimestamp(),
      });
      toast.success(`User ${!u.isActive ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      console.error('[AdminUsersPage] toggle error:', err);
      toast.error('Failed to update user status.');
    } finally {
      setToggling(null);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{r.name || '—'}</div>
            <div className="text-[11px] text-slate-500 dark:text-white/50">{r.uid?.slice(0, 10)}…</div>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email',
      render: r => <span className="text-sm text-slate-700 dark:text-white/80">{r.email}</span>,
    },
    {
      key: 'role', label: 'Role',
      render: r => {
        const roleColors = {
          business_owner: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30',
          lmo:            'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30',
          gatc:           'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
          admin:          'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
        };
        return (
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleColors[r.role] || 'bg-slate-500/15 text-slate-600 border-slate-400/30'}`}>
            {ROLE_LABELS[r.role] || r.role}
          </span>
        );
      },
    },
    {
      key: 'isActive', label: 'Status',
      render: r => (
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
          r.isActive !== false
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-400/30'
            : 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-400/30'
        }`}>
          {r.isActive !== false ? <CheckCircle size={10} /> : <XCircle size={10} />}
          {r.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Registered',
      render: r => <span className="text-xs text-slate-500 dark:text-white/50">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions', label: '',
      render: r => (
        <button
          onClick={() => handleToggleActive(r)}
          disabled={toggling === r.id}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
            r.isActive !== false
              ? 'bg-rose-500/10 hover:bg-rose-500 border-rose-400/30 text-rose-600 dark:text-rose-300 hover:text-white'
              : 'bg-emerald-500/10 hover:bg-emerald-500 border-emerald-400/30 text-emerald-600 dark:text-emerald-300 hover:text-white'
          }`}
        >
          {toggling === r.id
            ? <Loader size={12} className="animate-spin" />
            : r.isActive !== false ? 'Deactivate' : 'Activate'
          }
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="User Management"
        subtitle="Manage all registered users and their access permissions"
        breadcrumbs={['Home', 'Users']}
      />

      <div className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {users.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" description="Registered users will appear here." />
          </div>
        ) : (
          <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
