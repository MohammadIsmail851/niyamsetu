import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Shield, Calendar, User, Building, Package,
  QrCode, AlertTriangle, ArrowLeft, Download, ExternalLink
} from 'lucide-react';
import { MOCK_CERTIFICATES } from '@/data/mockData';
import { formatDate, daysUntilExpiry, cn } from '@/utils';
import { generateCertificatePDF } from '@/services/certificatePDF';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const CertificateVerifyPage = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCert = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      const found = MOCK_CERTIFICATES.find(c => c.certificateNumber === certificateId);
      if (found) {
        setCert(found);
        const url = await QRCode.toDataURL(`${window.location.origin}/verify/${found.certificateNumber}`, {
          width: 160, margin: 1, color: { dark: '#071A3D', light: '#FFFFFF' }
        });
        setQrDataUrl(url);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchCert();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin" />
          <div className="text-slate text-sm">Verifying certificate...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={36} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-slate text-sm mb-4">
            No certificate found with ID: <span className="font-mono font-bold">{certificateId}</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            This certificate may be invalid, revoked, or the ID may be incorrect.
            Please contact your Legal Metrology Officer for assistance.
          </p>
          <Link to="/" className="btn btn-primary">Go to NIYAMSETU</Link>
        </div>
      </div>
    );
  }

  const days = daysUntilExpiry(cert.validUntil);
  const isValid = days !== null && days > 0;
  const isExpiring = days !== null && days <= 30 && days > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">NS</span>
            </div>
            <div>
              <div className="font-bold text-sm">NIYAMSETU</div>
              <div className="text-white/60 text-[10px]">Certificate Verification Portal</div>
            </div>
          </div>
          <div className="text-[10px] text-white/50">
            Ministry of Consumer Affairs, GoI
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Authenticity Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'rounded-2xl p-6 mb-6 text-center',
            isValid ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'
          )}
        >
          <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3',
            isValid ? 'bg-green-100' : 'bg-red-100')}>
            {isValid
              ? <CheckCircle size={36} className="text-green-600" />
              : <AlertTriangle size={36} className="text-red-600" />
            }
          </div>
          <div className={cn('text-2xl font-bold mb-1', isValid ? 'text-green-700' : 'text-red-700')}>
            {isValid ? '✓ AUTHENTIC CERTIFICATE' : '⚠ EXPIRED CERTIFICATE'}
          </div>
          <div className={cn('text-sm', isValid ? 'text-green-600' : 'text-red-600')}>
            {isValid
              ? `Verified & Valid — ${days} days remaining`
              : 'This certificate has expired. Renewal required.'
            }
          </div>
          {isExpiring && (
            <div className="mt-2 text-xs text-amber-600 font-medium bg-amber-100 px-3 py-1 rounded-full inline-block">
              ⚠ Expiring Soon — Renewal recommended
            </div>
          )}
        </motion.div>

        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Certificate Header */}
          <div className="bg-navy text-white px-6 py-4">
            <div className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Government of India</div>
            <div className="text-sm text-white/80">Ministry of Consumer Affairs — Legal Metrology Division</div>
            <div className="text-lg font-bold mt-2">Certificate of Verification</div>
            <div className="text-xs text-white/60 mt-0.5">Legal Metrology Act, 2009 & Rules, 2011</div>
          </div>

          <div className="p-6">
            {/* Cert Number + QR */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="text-xs text-slate mb-1">Certificate Number</div>
                <div className="text-xl font-bold font-mono text-royal">{cert.certificateNumber}</div>
                <div className="text-xs text-slate mt-1">Verification ID: <span className="font-mono font-medium text-gray-700">{cert.verificationId}</span></div>
              </div>
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-1">
                  <img src={qrDataUrl} alt="QR Code" className="w-20 h-20 rounded-xl border border-gray-200" />
                  <div className="text-[9px] text-slate text-center">Scan to verify</div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {/* Business */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                  <Building size={11} /> Business Information
                </div>
                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-slate">Owner Name</span><div className="font-medium">{cert.ownerName}</div></div>
                  <div><span className="text-xs text-slate">Business Name</span><div className="font-medium">{cert.businessName}</div></div>
                  <div className="col-span-2"><span className="text-xs text-slate">GST Number</span><div className="font-medium font-mono">{cert.gstNumber}</div></div>
                  <div className="col-span-2"><span className="text-xs text-slate">Address</span><div className="font-medium">{cert.address}, {cert.district}, {cert.state}</div></div>
                </div>
              </div>

              {/* Instrument */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                  <Package size={11} /> Instrument Details
                </div>
                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-slate">Type</span><div className="font-medium">{cert.instrumentType}</div></div>
                  <div><span className="text-xs text-slate">Category</span><div className="font-medium">{cert.category}</div></div>
                  <div><span className="text-xs text-slate">Manufacturer</span><div className="font-medium">{cert.manufacturer}</div></div>
                  <div><span className="text-xs text-slate">Model No.</span><div className="font-medium">{cert.modelNumber}</div></div>
                  <div><span className="text-xs text-slate">Serial No.</span><div className="font-bold font-mono">{cert.serialNumber}</div></div>
                  <div><span className="text-xs text-slate">Capacity</span><div className="font-medium">{cert.capacity}</div></div>
                </div>
              </div>

              {/* Verification */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                  <Calendar size={11} /> Verification Details
                </div>
                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-slate">Verification Date</span><div className="font-medium">{formatDate(cert.verificationDate)}</div></div>
                  <div><span className="text-xs text-slate">Valid Until</span>
                    <div className={cn('font-bold', !isValid ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-green-700')}>
                      {formatDate(cert.validUntil)}
                    </div>
                  </div>
                  <div><span className="text-xs text-slate">Type</span><div className="font-medium">{cert.verificationType}</div></div>
                  <div><span className="text-xs text-slate">Result</span>
                    <div className="font-bold text-green-700 flex items-center gap-1"><CheckCircle size={12} /> PASSED</div>
                  </div>
                </div>
              </div>

              {/* Officer */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate uppercase tracking-wide mb-2">
                  <User size={11} /> Issuing Authority
                </div>
                <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-slate">Officer Name</span><div className="font-medium">{cert.officerName}</div></div>
                  <div><span className="text-xs text-slate">Designation</span><div className="font-medium">{cert.officerDesignation}</div></div>
                  <div><span className="text-xs text-slate">District</span><div className="font-medium">{cert.district}</div></div>
                  <div><span className="text-xs text-slate">State</span><div className="font-medium">{cert.state}</div></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => generateCertificatePDF(cert).then(() => toast.success('PDF downloaded!')).catch(() => toast.error('Failed'))}
                className="btn btn-primary flex-1"
              >
                <Download size={15} /> Download PDF
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 flex items-start gap-2">
              <Shield size={13} className="flex-shrink-0 mt-0.5" />
              This is an officially issued digital certificate. Verify at{' '}
              <a href={`/verify/${cert.certificateNumber}`} className="font-medium underline ml-1">
                niyamsetu.gov.in/verify/{cert.certificateNumber}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-royal hover:underline flex items-center gap-1 justify-center">
            <ArrowLeft size={14} /> Back to NIYAMSETU
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;
