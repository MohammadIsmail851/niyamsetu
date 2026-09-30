import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, FileText, Award, Clock, Plus, ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StatCard, StatusBadge, PageHeader, EmptyState } from '@/components/shared';
import { useAuthStore } from '@/store';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatDate, daysUntilExpiry } from '@/utils';

const OwnerDashboard = () => {
  const { profile, user } = useAuthStore();
  const ownerId = user?.uid || profile?.uid;
  const [apps, setApps] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) { setLoading(false); return; }

    setLoading(true);
    let loaded = 0;
    const tryDone = () => { if (++loaded >= 3) setLoading(false); };

    const unsubInstruments = onSnapshot(
      query(collection(db, 'instruments'), where('ownerId', '==', ownerId)),
      snap => { setInstruments(snap.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); },
      err => { console.error('Instruments snapshot error:', err); setInstruments([]); tryDone(); },
    );

    const unsubApps = onSnapshot(
      query(collection(db, 'applications'), where('ownerId', '==', ownerId)),
      snap => { setApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); },
      err => { console.error('Apps snapshot error:', err); setApps([]); tryDone(); },
    );

    const unsubCerts = onSnapshot(
      query(collection(db, 'certificates'), where('ownerId', '==', ownerId)),
      snap => { setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); tryDone(); },
      err => { console.error('Certs snapshot error:', err); setCerts([]); tryDone(); },
    );

    return () => { unsubInstruments(); unsubApps(); unsubCerts(); };
  }, [ownerId]);

  const activeCertificates = certs.filter(c => c.status === 'Active' || c.status === 'active' || (!c.status && c.certificateNumber)).length;
  const pendingDecisions = apps.filter(a => a.status === 'Pending' || a.status === 'pending' || ['submitted', 'assigned', 'scheduled'].includes(a.status)).length;
  const expiryDays = certs.length > 0 ? daysUntilExpiry(certs[0]?.validUntil) : null;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${profile?.name?.split(' ')[0] || 'Business Owner'} 👋`}
        subtitle="Manage and track your statutory legal metrology verifications"
        breadcrumbs={['Home', 'Dashboard']}
        actions={
          <Link
            to="/owner/applications/new"
            className="h-[46px] px-5 rounded-xl font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.99] transition-all"
          >
            <Plus size={16} />
            <span>New Application</span>
          </Link>
        }
      />

      {/* Dynamic Firestore Metrics Grid (Displays real values from Firestore, 0 if empty) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Package}
          label="Registered Instruments"
          value={instruments.length}
          color="navy"
        />
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={apps.length}
          color="blue"
        />
        <StatCard
          icon={Award}
          label="Active Certificates"
          value={activeCertificates}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Pending Decisions"
          value={pendingDecisions}
          color="amber"
        />
      </div>

      {/* Expiry Alert (Only displays if an actual certificate is expiring) */}
      {expiryDays !== null && expiryDays <= 30 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 p-4 rounded-[20px] mb-6 border backdrop-blur-xl ${
            expiryDays <= 7
              ? 'bg-rose-500/15 border-rose-400/40 text-rose-700 dark:text-rose-200'
              : 'bg-amber-500/15 border-amber-400/40 text-amber-700 dark:text-amber-200'
          }`}
        >
          <AlertTriangle size={20} className={expiryDays <= 7 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} />
          <div className="flex-1">
            <div className="font-bold text-sm">
              Certificate Expiring {expiryDays <= 0 ? 'Today!' : `in ${expiryDays} days`}
            </div>
            <div className="text-xs text-slate-600 dark:text-white/70 mt-0.5">
              {certs[0]?.certificateNumber} — {certs[0]?.instrumentType}. Apply for statutory re-verification.
            </div>
          </div>
          <Link
            to="/owner/applications/new"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 transition-all hover:scale-105"
          >
            Re-verify
          </Link>
        </motion.div>
      )}

      {/* Main Glass Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div
          className="rounded-[28px] p-6 transition-all duration-200 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Recent Applications</h2>
            {apps.length > 0 && (
              <Link to="/owner/applications" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors font-medium">
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {apps.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications submitted yet"
              description="Your first verification application will appear here."
              action={
                <Link
                  to="/owner/applications/new"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Submit Application</span>
                </Link>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {apps.slice(0, 5).map(app => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Package size={17} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{app.instrumentType}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-200/50 font-mono font-medium">{app.applicationId}</div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Instruments Card */}
        <div
          className="rounded-[28px] p-6 transition-all duration-200 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Registered Instruments</h2>
            {instruments.length > 0 && (
              <Link to="/owner/instruments" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors font-medium">
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {instruments.length === 0 ? (
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
          ) : (
            <div className="space-y-2.5">
              {instruments.slice(0, 4).map(inst => (
                <div
                  key={inst.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-400/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Package size={17} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{inst.instrumentType}</div>
                      <div className="text-xs text-slate-500 dark:text-white/50">SN: {inst.serialNumber}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              ))}

              <Link
                to="/owner/instruments/register"
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-white/20 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:border-blue-500 dark:hover:border-blue-400/50 hover:bg-blue-50/40 dark:hover:bg-white/5 transition-all text-xs font-semibold"
              >
                <Plus size={14} />
                <span>Register New Instrument</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Active Certificate Banner (if available) */}
      {certs.length > 0 && (
        <div
          className="mt-6 rounded-[28px] p-6 transition-all duration-200 bg-gradient-to-r from-blue-50 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-white/22 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <Award size={24} />
              </div>
              <div>
                <div className="text-blue-600 dark:text-white/60 text-xs mb-0.5 uppercase tracking-wider font-semibold">Active Digital Certificate</div>
                <div className="text-slate-900 dark:text-white font-bold text-lg font-mono">{certs[0].certificateNumber}</div>
                <div className="text-slate-600 dark:text-white/70 text-xs mt-0.5">{certs[0].instrumentType} — {certs[0].serialNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-slate-500 dark:text-white/50 text-[10px] uppercase tracking-wider">Valid Until</div>
                <div className="text-slate-900 dark:text-white font-semibold text-xs">{formatDate(certs[0].validUntil)}</div>
              </div>
              <Link
                to="/owner/certificates"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-white hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 transition-all hover:scale-105 shadow-xs"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerDashboard;
