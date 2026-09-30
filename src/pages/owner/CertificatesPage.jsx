import { useState, useEffect } from 'react';
import { Award, Download, QrCode, CheckCircle, Calendar, User } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, EmptyState } from '@/components/shared';
import { db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatDate, daysUntilExpiry } from '@/utils';
import { generateCertificatePDF } from '@/services/certificatePDF';
import toast from 'react-hot-toast';
import { cn } from '@/utils';
import { useAuthStore } from '@/store';

const CertificatesPage = () => {
  const { profile } = useAuthStore();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const ownerId = profile?.uid;
    if (!ownerId) { setLoading(false); return; }
    setLoading(true);
    const q = query(
      collection(db, 'certificates'),
      where('ownerId', '==', ownerId),
    );
    const unsub = onSnapshot(
      q,
      snap => { setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => { setCerts([]); setLoading(false); },
    );
    return () => unsub();
  }, [profile?.uid]);

  const handleDownload = async (cert) => {
    setDownloading(cert.id);
    try {
      await generateCertificatePDF(cert);
      toast.success('Certificate PDF generated successfully!');
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Certificates"
        subtitle="Download, manage, and verify official legal metrology certificates"
        breadcrumbs={['Dashboard', 'Certificates']}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Certificates Issued Yet"
          description="Tamper-proof digital certificates will appear here after physical verification by a Legal Metrology Officer."
        />
      ) : (
        <div className="space-y-4">
          {certs.map(cert => {
            const days = daysUntilExpiry(cert.validUntil);
            const isExpiring = days !== null && days <= 30 && days > 0;
            const isExpired = days !== null && days <= 0;

            return (
              <div
                key={cert.id}
                className={cn(
                  'rounded-[28px] p-6 transition-all duration-200 hover:scale-[1.01] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] border',
                  isExpired
                    ? 'border-rose-400/40 bg-rose-500/10'
                    : isExpiring
                    ? 'border-amber-400/40 bg-amber-500/10'
                    : 'border-slate-200/80 dark:border-white/18 bg-white/80 dark:bg-white/10'
                )}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border',
                        isExpired
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-400/30'
                          : isExpiring
                          ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-400/30'
                          : 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-400/30'
                      )}
                    >
                      <Award size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-base font-mono tracking-wide">{cert.certificateNumber}</span>
                        {isExpired ? (
                          <span className="badge badge-expired">Expired</span>
                        ) : isExpiring ? (
                          <span className="badge badge-assigned">Expiring in {days} days</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                            <CheckCircle size={11} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-800 dark:text-white/90 font-semibold">{cert.instrumentType}</div>
                      <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">{cert.businessName} — SN: {cert.serialNumber}</div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/60">
                          <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
                          <span>Issued: <span className="text-slate-900 dark:text-white font-medium">{formatDate(cert.verificationDate)}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/60">
                          <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
                          <span>Valid Until: <span className="text-slate-900 dark:text-white font-medium">{formatDate(cert.validUntil)}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-white/60">
                          <User size={12} className="text-blue-600 dark:text-blue-400" />
                          <span>Officer: <span className="text-slate-900 dark:text-white font-medium">{cert.officerName}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === cert.id}
                      className="h-[42px] px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>{downloading === cert.id ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                    <a
                      href={`/verify/${cert.certificateNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-[42px] px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <QrCode size={14} className="text-blue-600 dark:text-blue-400" />
                      <span>Verify Online</span>
                    </a>
                  </div>
                </div>

                {/* Verification ID Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                  <span>Verification ID:</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-300">{cert.verificationId}</span>
                  <span className="mx-2">•</span>
                  <span>{cert.verificationType}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CertificatesPage;
