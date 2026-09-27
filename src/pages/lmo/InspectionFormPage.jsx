import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Camera, MapPin, PenLine,
  Package, Calendar, User, AlertTriangle, Save, Send
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, StatusBadge, Spinner } from '@/components/shared';
import { MOCK_APPLICATIONS, MOCK_INSTRUMENTS } from '@/data/mockData';
import { formatDate, generateCertId } from '@/utils';
import toast from 'react-hot-toast';

const InspectionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null); // 'pass' | 'fail'
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef();

  const app = MOCK_APPLICATIONS.find(a => a.id === id) || MOCK_APPLICATIONS[1];
  const instrument = MOCK_INSTRUMENTS.find(i => i.id === app.instrumentId) || MOCK_INSTRUMENTS[1];

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: '10:00',
    }
  });

  const onSaveDraft = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Draft saved');
    setSaving(false);
  };

  const onSubmit = async (data) => {
    if (!result) { toast.error('Please select Pass or Fail'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    if (result === 'pass') {
      const certId = generateCertId();
      toast.success(`Instrument PASSED! Certificate ${certId} generated.`);
    } else {
      toast.error('Instrument marked as FAILED. Owner notified.');
    }
    navigate('/lmo/applications');
    setSubmitting(false);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Field Inspection Form"
        subtitle="Record verification observations for the Legal Metrology Act"
        breadcrumbs={['Dashboard', 'Applications', 'Inspect']}
      />

      <div className="max-w-2xl space-y-5">
        {/* Instrument Info */}
        <div className="card bg-navy text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <div>
                <div className="text-white/60 text-xs mb-0.5">Application</div>
                <div className="font-mono font-bold text-royal-400">{app.applicationId}</div>
                <div className="text-white font-semibold">{app.instrumentType}</div>
              </div>
            </div>
            <StatusBadge status={app.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-xs">
            <div><span className="text-white/50">Owner</span><div className="text-white/90 font-medium">{app.ownerName}</div></div>
            <div><span className="text-white/50">Business</span><div className="text-white/90 font-medium">{app.businessName}</div></div>
            <div><span className="text-white/50">Serial No.</span><div className="text-white/90 font-medium font-mono">{app.serialNumber}</div></div>
            <div><span className="text-white/50">Manufacturer</span><div className="text-white/90 font-medium">{instrument?.manufacturer}</div></div>
            <div><span className="text-white/50">Capacity</span><div className="text-white/90 font-medium">{instrument?.capacity}</div></div>
            <div><span className="text-white/50">District</span><div className="text-white/90 font-medium">{app.district}</div></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Schedule & Location */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-royal" /> Schedule & Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Inspection Date" required>
                <input {...register('inspectionDate', { required: true })} type="date" className="form-input" />
              </FormField>
              <FormField label="Inspection Time" required>
                <input {...register('inspectionTime', { required: true })} type="time" className="form-input" />
              </FormField>
              <div className="col-span-2">
                <FormField label="Location / Address">
                  <input {...register('location')} className="form-input" defaultValue={instrument?.address || ''} />
                </FormField>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <MapPin size={14} />
                  <span>GPS coordinates will be captured automatically on mobile devices</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Observations */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PenLine size={16} className="text-royal" /> Inspection Observations
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Instrument Condition" required error={errors.condition?.message}>
                  <select {...register('condition', { required: 'Required' })} className="form-input">
                    <option value="">Select</option>
                    <option value="good">Good — No damage observed</option>
                    <option value="fair">Fair — Minor wear</option>
                    <option value="poor">Poor — Significant damage</option>
                    <option value="defective">Defective — Unusable</option>
                  </select>
                </FormField>

                <FormField label="Seal Status" required error={errors.sealStatus?.message}>
                  <select {...register('sealStatus', { required: 'Required' })} className="form-input">
                    <option value="">Select</option>
                    <option value="intact">Intact — Seals present</option>
                    <option value="broken">Broken — Tampering observed</option>
                    <option value="absent">Absent — No seals found</option>
                    <option value="not_applicable">Not Applicable</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Accuracy Test Result" required error={errors.accuracyResult?.message}>
                  <select {...register('accuracyResult', { required: 'Required' })} className="form-input">
                    <option value="">Select</option>
                    <option value="within_tolerance">Within Permissible Error</option>
                    <option value="exceeded">Exceeds Permissible Error</option>
                    <option value="erratic">Erratic / Unstable</option>
                  </select>
                </FormField>

                <FormField label="Zero Error Check">
                  <select {...register('zeroError')} className="form-input">
                    <option value="">Select</option>
                    <option value="nil">Nil</option>
                    <option value="within_limit">Within Limit</option>
                    <option value="exceeds">Exceeds Limit</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Technical Observations">
                <textarea {...register('observations')} className="form-input" rows={3}
                  placeholder="Describe observations in detail: repeatability, sensitivity, discrimination, error values, etc." />
              </FormField>

              <FormField label="Remarks for Record">
                <textarea {...register('remarks')} className="form-input" rows={2}
                  placeholder="Official remarks to be recorded in verification register" />
              </FormField>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Camera size={16} className="text-royal" /> Inspection Photos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Instrument Front View', 'Nameplate / Serial', 'Seal / Stamp', 'Test Result Screen'].map(label => (
                <label key={label} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-royal cursor-pointer transition-colors">
                  <Camera size={20} className="text-slate mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{label}</div>
                  <input type="file" accept="image/*" capture="environment" className="hidden" />
                </label>
              ))}
            </div>
          </div>

          {/* Digital Signature Placeholder */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PenLine size={16} className="text-royal" /> Officer Signature
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <div className="text-slate text-sm mb-2">Digital Signature</div>
              <div className="text-xs text-gray-400">Touch signature or DSC integration (ready for API)</div>
              <button type="button" className="btn btn-outline btn-sm mt-3">
                <PenLine size={13} /> Sign Now
              </button>
            </div>
          </div>

          {/* PASS / FAIL Decision */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Verification Decision</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setResult('pass')}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  result === 'pass'
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle size={32} className={result === 'pass' ? 'text-green-600' : 'text-gray-300'} />
                <span className={`font-bold text-lg ${result === 'pass' ? 'text-green-700' : 'text-gray-400'}`}>PASS</span>
                <span className="text-xs text-center text-gray-500">Instrument meets all requirements. Certificate will be generated.</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('fail')}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  result === 'fail'
                    ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <XCircle size={32} className={result === 'fail' ? 'text-red-600' : 'text-gray-300'} />
                <span className={`font-bold text-lg ${result === 'fail' ? 'text-red-700' : 'text-gray-400'}`}>FAIL</span>
                <span className="text-xs text-center text-gray-500">Instrument does not conform to standards. Owner will be notified.</span>
              </button>
            </div>

            {result === 'pass' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2"
              >
                <CheckCircle size={15} className="text-green-600 mt-0.5" />
                <div className="text-sm text-green-700">
                  A QR-enabled digital certificate will be auto-generated upon submission.
                  Validity will be calculated as per Rule 28 of LM (General) Rules, 2011.
                </div>
              </motion.div>
            )}

            {result === 'fail' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3"
              >
                <FormField label="Reason for Rejection" required error={errors.rejectionReason?.message}>
                  <textarea
                    {...register('rejectionReason', { required: result === 'fail' ? 'Required when failing' : false })}
                    className="form-input"
                    rows={2}
                    placeholder="Specify the reason for rejection as per LM Act provisions"
                  />
                </FormField>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={onSaveDraft} disabled={saving} className="btn btn-ghost">
              {saving ? 'Saving...' : <><Save size={14} /> Save Draft</>}
            </button>
            <button
              type="submit"
              disabled={submitting || !result}
              className={`btn ${result === 'fail' ? 'btn-danger' : 'btn-primary'}`}
            >
              {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" /> Processing...</> :
                result === 'pass' ? <><Send size={14} /> Submit & Generate Certificate</> :
                result === 'fail' ? <><XCircle size={14} /> Submit Rejection</> :
                'Select Decision First'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InspectionFormPage;
