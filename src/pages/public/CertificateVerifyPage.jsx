import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Shield, Calendar, User, Building, Package,
  AlertTriangle, ArrowLeft, Download
} from 'lucide-react';
import { MOCK_CERTIFICATES } from '@/data/mockData';
import { formatDate, daysUntilExpiry, cn } from '@/utils';
import { generateCertificatePDF } from '@/services/certificatePDF';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import FloatingBlobs from '@/components/FloatingBlobs';
import ThemeToggle from '@/components/ThemeToggle';

const CertificateVerifyPage = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      const found = MOCK_CERTIFICATES.find(c => c.certificateNumber === certificateId);
      if (found) {
        setCert(found);
        try {
          const url = await QRCode.toDataURL(`${window.location.origin}/verify/${found.certificateNumber}`, {
            width: 160, margin: 1, color: { dark: '#04142F', light: '#FFFFFF' }
          });
          setQrDataUrl(url);
        } catch {
          // ignore qr error
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchCert();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] flex items-center justify-center relative overflow-hidden text-slate-800 dark:text-white">
        <FloatingBlobs />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600 dark:text-white/70 text-sm font-medium">Verifying official digital certificate...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] flex items-center justify-center p-4 relative overflow-hidden text-slate-800 dark:text-white">
        <FloatingBlobs />
        <div className="text-center max-w-md p-8 relative z-10 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200 dark:border-white/18 shadow-2xl">
          <div className="w-20 h-20 bg-rose-500/15 dark:bg-rose-500/20 border border-rose-400/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 dark:text-rose-400">
            <AlertTriangle size={38} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Certificate Not Found</h1>
          <p className="text-slate-600 dark:text-white/70 text-sm mb-4">
            No certificate found matching: <span className="font-mono font-bold text-rose-600 dark:text-rose-300">{certificateId}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-white/50 mb-6 leading-relaxed">
            This certificate may be unverified, revoked, or an incorrect reference number was scanned.
          </p>
          <Link
            to="/"
            className="h-[46px] px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_18px_rgba(37,99,235,0.4)] transition-all inline-flex items-center gap-2"
          >
            <span>Return to NIYAMSETU</span>
          </Link>
        </div>
      </div>
    );
  }

  const days = daysUntilExpiry(cert.validUntil);
  const isValid = days !== null && days > 0;
  const isExpiring = days !== null && days <= 30 && days > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] text-slate-800 dark:text-white relative overflow-x-hidden transition-colors duration-300">
      <FloatingBlobs />

      {/* Top Header */}
      <header className="relative z-10 bg-white/80 dark:bg-white/5 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-600/30 border border-blue-500/20 dark:border-blue-400/40 flex items-center justify-center">
              <Shield size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-slate-900 dark:text-white">NIYAMSETU</div>
              <div className="text-blue-600 dark:text-blue-200/50 text-[10px] uppercase tracking-wider font-semibold">Public Certificate Verification</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-[11px] text-slate-500 dark:text-white/50 hidden sm:block">
              Government of India
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Authenticity Glass Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'rounded-[28px] p-6 mb-6 text-center border backdrop-blur-xl',
            isValid
              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 dark:border-emerald-400/40 shadow-[0_4px_20px_rgba(16,185,129,0.15)] dark:shadow-[0_0_30px_rgba(16,185,129,0.25)]'
              : 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 dark:border-rose-400/40 shadow-[0_4px_20px_rgba(244,63,94,0.15)] dark:shadow-[0_0_30px_rgba(244,63,94,0.25)]'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md border',
              isValid
                ? 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-400/40 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/20 dark:bg-rose-500/25 border-rose-400/40 text-rose-600 dark:text-rose-300'
            )}
          >
            {isValid ? <CheckCircle size={36} /> : <AlertTriangle size={36} />}
          </div>
          <div className={cn('text-2xl font-extrabold tracking-wide mb-1', isValid ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
            {isValid ? '✓ AUTHENTIC CERTIFICATE' : '⚠ EXPIRED CERTIFICATE'}
          </div>
          <div className="text-sm text-slate-700 dark:text-white/80">
            {isValid
              ? `Digitally Verified & Active — ${days} days remaining`
              : 'This statutory certificate has expired. Periodic re-verification required.'}
          </div>
          {isExpiring && (
            <div className="mt-2.5 text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-500/15 dark:bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full inline-block">
              ⚠ Expiring Soon — Renewal application advised
            </div>
          )}
        </motion.div>

        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] overflow-hidden bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-blue-700/90 to-indigo-800/90 dark:from-blue-900/60 dark:to-indigo-900/60 p-6 border-b border-slate-200/20 dark:border-white/10 text-white">
            <div className="text-[10px] text-blue-200 uppercase tracking-widest mb-1 font-bold">Government of India</div>
            <div className="text-sm text-white/90">Ministry of Consumer Affairs — Legal Metrology Division</div>
            <div className="text-xl font-bold mt-2 text-white">Certificate of Verification</div>
            <div className="text-xs text-blue-100/70 mt-0.5">Under Legal Metrology Act, 2009 & Rules, 2011</div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Cert Number + QR */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div>
                <div className="text-xs text-slate-500 dark:text-white/50 mb-1">Certificate Number</div>
                <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-300">{cert.certificateNumber}</div>
                <div className="text-xs text-slate-500 dark:text-white/50 mt-1">
                  Verification ID: <span className="font-mono text-slate-700 dark:text-white/80">{cert.verificationId}</span>
                </div>
              </div>
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-1">
                  <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 rounded-xl bg-white p-1 shadow-md border border-slate-200" />
                  <div className="text-[9px] text-slate-500 dark:text-white/50 text-center">Scan to verify</div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {/* Business Info */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider mb-2">
                  <Building size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>Business Information</span>
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Owner Name</span><div className="font-semibold text-slate-900 dark:text-white">{cert.ownerName}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Business Name</span><div className="font-semibold text-slate-900 dark:text-white">{cert.businessName}</div></div>
                  <div className="sm:col-span-2"><span className="text-slate-500 dark:text-white/50 block mb-0.5">GST Number</span><div className="font-mono font-semibold text-slate-900 dark:text-white">{cert.gstNumber}</div></div>
                  <div className="sm:col-span-2"><span className="text-slate-500 dark:text-white/50 block mb-0.5">Address</span><div className="text-slate-700 dark:text-white/80">{cert.address}, {cert.district}, {cert.state}</div></div>
                </div>
              </div>

              {/* Instrument Details */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider mb-2">
                  <Package size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>Instrument Details</span>
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Type</span><div className="font-semibold text-slate-900 dark:text-white">{cert.instrumentType}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Category</span><div className="font-semibold text-slate-900 dark:text-white">{cert.category}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Manufacturer</span><div className="font-semibold text-slate-900 dark:text-white">{cert.manufacturer}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Model</span><div className="font-semibold text-slate-900 dark:text-white">{cert.modelNumber}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Serial No.</span><div className="font-mono font-bold text-blue-600 dark:text-blue-300">{cert.serialNumber}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Capacity</span><div className="font-semibold text-slate-900 dark:text-white">{cert.capacity}</div></div>
                </div>
              </div>

              {/* Verification Details */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider mb-2">
                  <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>Verification Validity</span>
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Verification Date</span><div className="font-semibold text-slate-900 dark:text-white">{formatDate(cert.verificationDate)}</div></div>
                  <div>
                    <span className="text-slate-500 dark:text-white/50 block mb-0.5">Valid Until</span>
                    <div className={cn('font-bold', !isValid ? 'text-rose-600 dark:text-rose-400' : isExpiring ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-300')}>
                      {formatDate(cert.validUntil)}
                    </div>
                  </div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Verification Type</span><div className="font-semibold text-slate-900 dark:text-white">{cert.verificationType}</div></div>
                  <div>
                    <span className="text-slate-500 dark:text-white/50 block mb-0.5">Result</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-300 flex items-center gap-1"><CheckCircle size={12} /> PASSED</div>
                  </div>
                </div>
              </div>

              {/* Issuing Authority */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-white/60 uppercase tracking-wider mb-2">
                  <User size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>Issuing Officer</span>
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Officer Name</span><div className="font-semibold text-slate-900 dark:text-white">{cert.officerName}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Designation</span><div className="font-semibold text-slate-900 dark:text-white">{cert.officerDesignation}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">District</span><div className="font-semibold text-slate-900 dark:text-white">{cert.district}</div></div>
                  <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">State</span><div className="font-semibold text-slate-900 dark:text-white">{cert.state}</div></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                onClick={() => generateCertificatePDF(cert).then(() => toast.success('Certificate PDF downloaded!')).catch(() => toast.error('Failed'))}
                className="w-full h-[52px] rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.55)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
              >
                <Download size={16} />
                <span>Download Official Certificate PDF</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 inline-flex items-center gap-1 transition-colors font-medium">
            <ArrowLeft size={14} />
            <span>Back to NIYAMSETU Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
