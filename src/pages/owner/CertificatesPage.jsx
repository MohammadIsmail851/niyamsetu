import { useState } from 'react';
import { Award, Download, QrCode, CheckCircle, Calendar, User, Building } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, EmptyState } from '@/components/shared';
import { MOCK_CERTIFICATES } from '@/data/mockData';
import { formatDate, daysUntilExpiry } from '@/utils';
import { generateCertificatePDF } from '@/services/certificatePDF';
import toast from 'react-hot-toast';
import { cn } from '@/utils';

const CertificatesPage = () => {
  const certs = MOCK_CERTIFICATES;
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (cert) => {
    setDownloading(cert.id);
    try {
      await generateCertificatePDF(cert);
      toast.success('Certificate PDF downloaded!');
    } catch (e) {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="My Certificates"
        subtitle="Download and verify your legal metrology certificates"
        breadcrumbs={['Dashboard', 'Certificates']}
      />

      {certs.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Certificates Yet"
          description="Certificates will appear here after successful instrument verification"
        />
      ) : (
        <div className="space-y-4">
          {certs.map(cert => {
            const days = daysUntilExpiry(cert.validUntil);
            const isExpiring = days !== null && days <= 30 && days > 0;
            const isExpired = days !== null && days <= 0;

            return (
              <div key={cert.id} className={cn('card', isExpired ? 'border-red-200' : isExpiring ? 'border-amber-300' : 'border-green-200')}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                      isExpired ? 'bg-red-100' : isExpiring ? 'bg-amber-100' : 'bg-green-100')}>
                      <Award size={24} className={isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-green-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-900 font-mono">{cert.certificateNumber}</span>
                        {isExpired ? (
                          <span className="badge badge-expired">Expired</span>
                        ) : isExpiring ? (
                          <span className="badge badge-assigned">Expiring in {days} days</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle size={11} /> Valid
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{cert.instrumentType}</div>
                      <div className="text-xs text-slate mt-0.5">{cert.businessName} — SN: {cert.serialNumber}</div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 mt-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate">
                          <Calendar size={12} />
                          Issued: <span className="text-gray-700 font-medium">{formatDate(cert.verificationDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate">
                          <Calendar size={12} />
                          Valid Until: <span className="text-gray-700 font-medium">{formatDate(cert.validUntil)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate">
                          <User size={12} />
                          Officer: <span className="text-gray-700 font-medium">{cert.officerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === cert.id}
                      className="btn btn-primary btn-sm"
                    >
                      <Download size={14} />
                      {downloading === cert.id ? 'Generating...' : 'Download PDF'}
                    </button>
                    <a
                      href={`/verify/${cert.certificateNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm text-xs"
                    >
                      <QrCode size={14} /> Verify Online
                    </a>
                  </div>
                </div>

                {/* Verification ID */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-slate">
                  <span>Verification ID:</span>
                  <span className="font-mono font-medium text-gray-700">{cert.verificationId}</span>
                  <span className="mx-2">·</span>
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
