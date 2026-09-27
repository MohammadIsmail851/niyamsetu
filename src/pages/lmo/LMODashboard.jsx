import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, Award,
  Calendar, MapPin, ArrowRight, User
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, StatusBadge, PageHeader, EmptyState } from '@/components/shared';
import { getDocuments } from '@/firebase/firestore';
import { useAuthStore } from '@/store';
import { formatDate } from '@/utils';

const LMODashboard = () => {
  const { profile } = useAuthStore();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLmoData = async () => {
      setLoading(true);
      try {
        const firestoreApps = await getDocuments('applications');
        if (isMounted) setApps(firestoreApps || []);
      } catch {
        if (isMounted) setApps([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchLmoData();
    return () => { isMounted = false; };
  }, []);

  const assigned = apps.filter(a => a.status !== 'certificate_generated');
  const pending = apps.filter(a => ['assigned', 'scheduled'].includes(a.status));
  const completed = apps.filter(a => a.status === 'inspection_completed');
  const certs = apps.filter(a => a.status === 'certificate_generated');

  return (
    <DashboardLayout>
      <PageHeader
        title="Officer Dashboard"
        subtitle={`${profile?.name || 'Legal Metrology Officer'} — Division: ${profile?.district || 'State Division'}`}
        breadcrumbs={['Home', 'Dashboard']}
      />

      {/* Dynamic Stats Grid (Real counts from Firestore, 0 if empty) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText}    label="Assigned Inspections" value={assigned.length}  color="blue" />
        <StatCard icon={Clock}       label="Pending Visits"       value={pending.length}   color="amber" />
        <StatCard icon={CheckCircle} label="Completed"            value={completed.length} color="green" />
        <StatCard icon={Award}       label="Certificates Issued"  value={certs.length}     color="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Applications Glass Card */}
        <div
          className="rounded-[28px] p-6 transition-all duration-200 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Assigned Applications</h2>
            {assigned.length > 0 && (
              <Link to="/lmo/applications" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors font-medium">
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {assigned.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No inspection tasks assigned"
              description="Verification assignments dispatched by the district administrator will appear here."
            />
          ) : (
            <div className="space-y-3">
              {assigned.map(app => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{app.instrumentType}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-200/50 font-mono font-medium">{app.applicationId}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/60 mb-3">
                    <span className="flex items-center gap-1"><User size={12} className="text-blue-600 dark:text-blue-400" />{app.ownerName}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-600 dark:text-blue-400" />{app.district}</span>
                    {app.preferredDate && (
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-blue-600 dark:text-blue-400" />{formatDate(app.preferredDate)}</span>
                    )}
                  </div>
                  <Link
                    to={`/lmo/applications/${app.id}`}
                    className="h-[38px] px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_12px_rgba(37,99,235,0.3)] dark:shadow-[0_0_12px_rgba(37,99,235,0.4)] flex items-center justify-center transition-all"
                  >
                    {app.status === 'assigned' ? 'Schedule & Inspect' : 'View Inspection Form'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Division Guidelines & Protocol Glass Card */}
        <div
          className="rounded-[28px] p-6 transition-all duration-200 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4">Inspection Protocols (Act, 2009)</h2>
          <div className="space-y-3 text-xs text-slate-600 dark:text-white/70">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Standard Operating Procedure</div>
              <p className="leading-relaxed">All physical verification visits must check zero error, sensitivity tolerance, and physical stamp integrity as per Schedule VII.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">GPS & Photo Evidence</div>
              <p className="leading-relaxed">Capture geotagged instrument photo and seal stamp on-site before issuing approval.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Digital QR Certificates</div>
              <p className="leading-relaxed">Approved instruments generate cryptographic QR verification certificates available instantly to the business owner.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LMODashboard;
