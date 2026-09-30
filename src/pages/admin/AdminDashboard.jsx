import { useState, useEffect } from 'react';
import { Users, Package, FileText, Award, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as ReChartsPie, Pie, Cell, Legend
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, PageHeader, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const COLORS = ['#2563EB', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboardPage = () => {
  const [users,       setUsers]       = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [apps,        setApps]        = useState([]);
  const [certs,       setCerts]       = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let loaded = 0;
    const tryDone = () => { if (++loaded >= 4) setLoading(false); };

    const u1 = onSnapshot(collection(db, 'users'),        s => { setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); }, () => { setUsers([]); tryDone(); });
    const u2 = onSnapshot(collection(db, 'instruments'),  s => { setInstruments(s.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); }, () => { setInstruments([]); tryDone(); });
    const u3 = onSnapshot(collection(db, 'applications'), s => { setApps(s.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); }, () => { setApps([]); tryDone(); });
    const u4 = onSnapshot(collection(db, 'certificates'), s => { setCerts(s.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); }, () => { setCerts([]); tryDone(); });

    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const pending  = apps.filter(a => ['submitted', 'assigned', 'scheduled'].includes(a.status)).length;
  const approved = apps.filter(a => ['verified', 'certificate_generated', 'inspection_completed'].includes(a.status)).length;
  const rejected = apps.filter(a => a.status === 'rejected').length;

  // District breakdown chart
  const districtMap = {};
  apps.forEach(a => {
    const d = a.district || 'Other';
    if (!districtMap[d]) districtMap[d] = { district: d, count: 0, pending: 0 };
    districtMap[d].count += 1;
    if (['submitted', 'assigned', 'scheduled'].includes(a.status)) districtMap[d].pending += 1;
  });
  const districtData = Object.values(districtMap).slice(0, 8);

  // Category breakdown chart
  const catMap = {};
  instruments.forEach(i => {
    const c = i.instrumentType || i.category || 'General';
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const categoryData = Object.entries(catMap).slice(0, 6).map(([name, value]) => ({ name: name.split(' ').slice(0,3).join(' '), value }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Administration Dashboard"
        subtitle="State-wide overview of Legal Metrology verification operations"
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}      label="Total Users"            value={users.length}        color="navy" />
        <StatCard icon={Package}    label="Registered Instruments" value={instruments.length}  color="blue" />
        <StatCard icon={FileText}   label="Pending Applications"   value={pending}             color="amber" />
        <StatCard icon={Award}      label="Active Certificates"    value={certs.length}        color="green" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText}      label="Total Applications" value={apps.length}  color="navy" />
        <StatCard icon={TrendingUp}    label="Approved"           value={approved}     color="green" />
        <StatCard icon={AlertTriangle} label="Rejected"           value={rejected}     color="red" />
        <StatCard icon={Clock}         label="In Progress"        value={pending}      color="amber" />
      </div>

      {/* Charts */}
      {apps.length === 0 && instruments.length === 0 ? (
        <div className="rounded-[28px] p-8 mb-6 text-center bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <EmptyState
            icon={FileText}
            title="No analytics data yet"
            description="Charts will populate as applications and instruments are registered."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Instruments by Category */}
          {categoryData.length > 0 && (
            <div className="rounded-[28px] p-6 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Instruments by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <ReChartsPie>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </ReChartsPie>
              </ResponsiveContainer>
            </div>
          )}

          {/* District Pendency */}
          {districtData.length > 0 && (
            <div className="rounded-[28px] p-6 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4">District-wise Applications</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={districtData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(100,116,139,0.15)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="district" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
                  <Bar dataKey="count"   fill="rgba(59,130,246,0.4)" radius={[0, 4, 4, 0]} name="Total" />
                  <Bar dataKey="pending" fill="#2563EB"              radius={[0, 4, 4, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
