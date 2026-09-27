import { useState, useEffect } from 'react';
import {
  BarChart2, TrendingUp, FileText,
  Award, Clock, AlertTriangle, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as ReChartsPie, Pie, Cell, Legend
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, PageHeader, DataTable, StatusBadge, EmptyState } from '@/components/shared';
import { getDocuments } from '@/firebase/firestore';
import { formatDate } from '@/utils';

const COLORS = ['#2563EB', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [apps, setApps] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Values from Firestore only
        const [appDocs, certDocs] = await Promise.all([
          getDocuments('applications'),
          getDocuments('certificates'),
        ]);

        if (isMounted) {
          setApps(appDocs || []);
          setCerts(certDocs || []);
        }
      } catch (err) {
        // If database is empty, unconfigured, or offline, show elegant empty states (no fake metrics)
        if (isMounted) {
          setApps([]);
          setCerts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();
    return () => { isMounted = false; };
  }, []);

  // Compute dynamic stats strictly from real data
  const total = apps.length;
  const pending = apps.filter(a => ['submitted', 'assigned', 'scheduled'].includes(a.status)).length;
  const approved = apps.filter(a => ['verified', 'certificate_generated'].includes(a.status)).length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  const activeCertificates = certs.length;
  const expiringThisMonth = certs.filter(c => c.isExpiring).length;

  // Build dynamic district data if records exist
  const districtMap = {};
  apps.forEach(a => {
    const d = a.district || 'Other';
    if (!districtMap[d]) districtMap[d] = { district: d, count: 0, pending: 0 };
    districtMap[d].count += 1;
    if (['submitted', 'assigned', 'scheduled'].includes(a.status)) {
      districtMap[d].pending += 1;
    }
  });
  const districtData = Object.values(districtMap);

  // Build dynamic category data if records exist
  const categoryMap = {};
  apps.forEach(a => {
    const cat = a.category || a.instrumentType || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const appColumns = [
    { key: 'applicationId', label: 'App ID', render: r => <span className="font-mono text-xs text-blue-600 dark:text-blue-300 font-semibold">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'ownerName',     label: 'Owner' },
    { key: 'district',      label: 'District' },
    { key: 'submittedAt',   label: 'Submitted', render: r => <span className="text-xs text-slate-500 dark:text-white/70">{formatDate(r.submittedAt)}</span> },
    { key: 'status',        label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Administration Dashboard"
        subtitle="State-wide dynamic overview of Legal Metrology verification operations"
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={FileText}       label="Total Applications"  value={total}              color="navy" />
        <StatCard icon={Clock}          label="Pending"             value={pending}            color="amber" />
        <StatCard icon={TrendingUp}     label="Approved"            value={approved}           color="green" />
        <StatCard icon={AlertTriangle}  label="Rejected"            value={rejected}           color="red" />
        <StatCard icon={Award}          label="Active Certificates" value={activeCertificates} color="blue" />
        <StatCard icon={AlertTriangle}  label="Expiring This Month" value={expiringThisMonth}  color="amber" />
      </div>

      {/* Charts Section or Dynamic Empty State */}
      {apps.length === 0 ? (
        <div
          className="rounded-[28px] p-8 mb-6 text-center bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <EmptyState
            icon={BarChart2}
            title="No verification analytics recorded yet"
            description="District pendency, monthly trends, and officer workload will dynamically calculate as applications are submitted and processed."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* By Instrument Category */}
          <div
            className="rounded-[28px] p-6 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4">By Instrument Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <ReChartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </ReChartsPie>
            </ResponsiveContainer>
          </div>

          {/* District Pendency */}
          <div
            className="rounded-[28px] p-6 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
              <span>District-wise Verification Breakdown</span>
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={districtData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="district" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }} />
                <Bar dataKey="count" fill="rgba(59, 130, 246, 0.4)" radius={[0, 4, 4, 0]} name="Total" />
                <Bar dataKey="pending" fill="#2563EB" radius={[0, 4, 4, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Applications Table Card */}
      <div
        className="rounded-[28px] p-0 overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Verification Applications</h2>
          <span className="text-xs text-slate-500 dark:text-white/50">{apps.length} Total Records</span>
        </div>
        <DataTable
          columns={appColumns}
          data={apps}
          loading={loading}
          emptyMessage="No verification applications recorded in database yet."
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
