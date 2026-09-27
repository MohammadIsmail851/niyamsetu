import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, FileText, Award, Clock, Plus, ArrowRight,
  Bell, CheckCircle, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, StatusBadge, PageHeader } from '@/components/shared';
import { useAuthStore } from '@/store';
import { MOCK_APPLICATIONS, MOCK_INSTRUMENTS, MOCK_CERTIFICATES } from '@/data/mockData';
import { formatDate, daysUntilExpiry } from '@/utils';

const OwnerDashboard = () => {
  const { profile } = useAuthStore();
  const apps = MOCK_APPLICATIONS;
  const instruments = MOCK_INSTRUMENTS;
  const certs = MOCK_CERTIFICATES;

  const expiryDays = daysUntilExpiry(certs[0]?.validUntil);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'User'} 👋`}
        subtitle="Track your instrument verifications and certificates"
        breadcrumbs={['Home', 'Dashboard']}
        actions={
          <Link to="/owner/applications/new" className="btn btn-primary">
            <Plus size={16} /> New Application
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package}   label="Registered Instruments" value={instruments.length} color="navy" />
        <StatCard icon={FileText}  label="Total Applications"      value={apps.length}       color="blue" />
        <StatCard icon={Award}     label="Active Certificates"     value={certs.length}      color="green" />
        <StatCard icon={Clock}     label="Pending Decisions"       value={apps.filter(a => ['submitted','assigned','scheduled'].includes(a.status)).length} color="amber" />
      </div>

      {/* Expiry Alert */}
      {expiryDays !== null && expiryDays <= 30 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 p-4 rounded-xl mb-6 border ${expiryDays <= 7 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
        >
          <AlertTriangle size={18} className={expiryDays <= 7 ? 'text-red-600' : 'text-amber-600'} />
          <div>
            <div className={`font-semibold ${expiryDays <= 7 ? 'text-red-700' : 'text-amber-700'}`}>
              Certificate Expiring {expiryDays <= 0 ? 'Today!' : `in ${expiryDays} days`}
            </div>
            <div className="text-sm text-gray-600">
              {certs[0]?.certificateNumber} — {certs[0]?.instrumentType}. Apply for re-verification now.
            </div>
          </div>
          <Link to="/owner/applications/new" className="ml-auto btn btn-sm btn-outline">
            Re-verify
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/owner/applications" className="text-sm text-royal hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {apps.map(app => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package size={15} className="text-royal" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{app.instrumentType}</div>
                    <div className="text-xs text-slate">{app.applicationId}</div>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Instruments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Registered Instruments</h2>
            <Link to="/owner/instruments" className="text-sm text-royal hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {instruments.map(inst => (
              <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package size={15} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{inst.instrumentType}</div>
                    <div className="text-xs text-slate">SN: {inst.serialNumber}</div>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
            <Link to="/owner/instruments/register" className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl text-slate hover:border-royal hover:text-royal transition-colors text-sm font-medium">
              <Plus size={16} /> Register New Instrument
            </Link>
          </div>
        </div>
      </div>

      {/* Active Certificate */}
      {certs.length > 0 && (
        <div className="mt-6 card bg-gradient-to-r from-navy to-navy-700 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <div className="text-white/70 text-xs mb-0.5">Active Certificate</div>
                <div className="text-white font-bold text-lg">{certs[0].certificateNumber}</div>
                <div className="text-white/60 text-sm">{certs[0].instrumentType} — {certs[0].serialNumber}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-xs">Valid Until</div>
              <div className="text-white font-semibold">{formatDate(certs[0].validUntil)}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs bg-green-400/20 text-green-300 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> Valid
                </span>
                <Link to={`/owner/certificates`} className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full transition-colors">
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerDashboard;
