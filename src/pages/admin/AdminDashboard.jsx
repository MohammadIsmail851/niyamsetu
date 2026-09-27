import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, PieChart, TrendingUp, Users, FileText,
  Award, Clock, AlertTriangle, MapPin, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as ReChartsPie, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, PageHeader, DataTable, StatusBadge } from '@/components/shared';
import { MOCK_ANALYTICS, MOCK_APPLICATIONS } from '@/data/mockData';
import { formatDate } from '@/utils';

const COLORS = ['#2563EB', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const { total, pending, approved, rejected, activeCertificates, expiringThisMonth,
    districtData, monthlyData, categoryData, officerData } = MOCK_ANALYTICS;

  const appColumns = [
    { key: 'applicationId', label: 'App ID', render: r => <span className="font-mono text-xs text-royal">{r.applicationId}</span> },
    { key: 'instrumentType', label: 'Instrument' },
    { key: 'ownerName',     label: 'Owner' },
    { key: 'district',      label: 'District' },
    { key: 'submittedAt',   label: 'Submitted', render: r => <span className="text-xs">{formatDate(r.submittedAt)}</span> },
    { key: 'status',        label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Administration Dashboard"
        subtitle="State-wide overview of Legal Metrology verification activities"
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={FileText}       label="Total Applications"    value={total}                 color="navy"   className="col-span-1" />
        <StatCard icon={Clock}          label="Pending"               value={pending}               color="amber" />
        <StatCard icon={TrendingUp}     label="Approved"              value={approved}              color="green" />
        <StatCard icon={AlertTriangle}  label="Rejected"              value={rejected}              color="red" />
        <StatCard icon={Award}          label="Active Certificates"   value={activeCertificates}    color="blue" />
        <StatCard icon={AlertTriangle}  label="Expiring This Month"   value={expiringThisMonth}     color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Verifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Monthly Verifications</h2>
            <span className="text-xs text-slate">FY 2026–27</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="verified" stroke="#2563EB" strokeWidth={2} fill="url(#colorVerified)" name="Verified" />
              <Area type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} fill="none" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Instrument Categories */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">By Instrument Category</h2>
            <span className="text-xs text-slate">All districts</span>
          </div>
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
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </ReChartsPie>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* District Pendency */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin size={15} className="text-royal" /> District-wise Pendency
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districtData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" fill="#dbeafe" radius={[0, 4, 4, 0]} name="Total" />
              <Bar dataKey="pending" fill="#2563EB" radius={[0, 4, 4, 0]} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Officer Workload */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={15} className="text-royal" /> Officer Workload
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={officerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="assigned" fill="#dbeafe" radius={[4, 4, 0, 0]} name="Assigned" />
              <Bar dataKey="completed" fill="#2563EB" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Applications</h2>
          <button className="btn btn-outline btn-sm">Export CSV</button>
        </div>
        <DataTable columns={appColumns} data={MOCK_APPLICATIONS} />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
