import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Clock, CheckCircle, Award,
  Calendar, MapPin, ArrowRight, AlertCircle, User
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, StatusBadge, PageHeader } from '@/components/shared';
import { MOCK_APPLICATIONS } from '@/data/mockData';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';

const LMODashboard = () => {
  const { profile } = useAuthStore();
  const assigned = MOCK_APPLICATIONS.filter(a => a.status !== 'certificate_generated');
  const pending = MOCK_APPLICATIONS.filter(a => ['assigned','scheduled'].includes(a.status));
  const completed = MOCK_APPLICATIONS.filter(a => a.status === 'inspection_completed');
  const certs = MOCK_APPLICATIONS.filter(a => a.status === 'certificate_generated');

  const today = new Date().toDateString();

  return (
    <DashboardLayout>
      <PageHeader
        title={`Officer Dashboard`}
        subtitle={`${profile?.name || 'Officer'} — Legal Metrology Division, ${profile?.district || 'Hyderabad'}`}
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText}    label="Assigned Today"       value={2}               color="blue" />
        <StatCard icon={Clock}       label="Pending Inspections"  value={pending.length}  color="amber" />
        <StatCard icon={CheckCircle} label="Completed"            value={completed.length + 1} color="green" />
        <StatCard icon={Award}       label="Certificates Issued"  value={certs.length}    color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Assigned Applications</h2>
            <Link to="/lmo/applications" className="text-sm text-royal hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {assigned.map(app => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 border border-gray-200 rounded-xl hover:border-royal hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{app.instrumentType}</div>
                    <div className="text-xs text-slate font-mono">{app.applicationId}</div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate">
                  <span className="flex items-center gap-1"><User size={11} />{app.ownerName}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{app.district}</span>
                  {app.preferredDate && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(app.preferredDate)}</span>}
                </div>
                <div className="flex gap-2 mt-2">
                  <Link to={`/lmo/applications/${app.id}`} className="btn btn-primary btn-sm text-xs flex-1 justify-center">
                    {app.status === 'assigned' ? 'Schedule & Inspect' : 'View Details'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Schedule Calendar Placeholder */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-royal" />
            Inspection Schedule
          </h2>
          <div className="space-y-2">
            {[
              { date: 'Today, 10:00 AM',    inst: 'Platform Balance', loc: 'Medchal, Telangana',    status: 'scheduled' },
              { date: 'Today, 2:30 PM',     inst: 'Electronic Balance', loc: 'Patancheru Industrial', status: 'scheduled' },
              { date: 'Tomorrow, 9:00 AM',  inst: 'Petrol Dispenser', loc: 'Shamshabad, RR District', status: 'assigned' },
              { date: 'Fri, 11:00 AM',      inst: 'Weighbridge',      loc: 'Uppal, Hyderabad',       status: 'assigned' },
            ].map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${slot.status === 'scheduled' ? 'bg-purple-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">{slot.inst}</div>
                  <div className="text-xs text-slate flex items-center gap-1">
                    <MapPin size={10} /> {slot.loc}
                  </div>
                </div>
                <div className="text-xs text-gray-600 flex-shrink-0">{slot.date}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <AlertCircle size={13} />
              <span>3 applications awaiting your inspection report submission</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LMODashboard;
