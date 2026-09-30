import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Camera, MapPin, PenLine,
  Package, Calendar, Save, Send, Loader
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, StatusBadge, Spinner } from '@/components/shared';
import { db } from '@/firebase';
import {
  doc, getDoc, updateDoc, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import { useAuthStore } from '@/store';
import { generateCertId } from '@/utils';
import toast from 'react-hot-toast';

const InspectionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [result, setResult] = useState(null); // 'pass' | 'fail'
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [app, setApp] = useState(null);
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionTime: '10:00',
    }
  });

  // ── Load application + instrument ────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const appSnap = await getDoc(doc(db, 'applications', id));
        if (!appSnap.exists()) { toast.error('Application not found'); setLoading(false); return; }
        const appData = { id: appSnap.id, ...appSnap.data() };
        setApp(appData);

        if (appData.instrumentId) {
          const instSnap = await getDoc(doc(db, 'instruments', appData.instrumentId));
          if (instSnap.exists()) setInstrument({ id: instSnap.id, ...instSnap.data() });
        }
      } catch (err) {
        console.error('[InspectionFormPage] load error:', err);
        toast.error('Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Save draft ───────────────────────────────────────────────────────────
  const onSaveDraft = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'applications', id), {
        status: 'inspection_in_progress',
        updatedAt: serverTimestamp(),
      });
      toast.success('Inspection draft saved');
    } catch (err) {
      toast.error('Save failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // ── Submit (Approve / Reject) ────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!result) { toast.error('Please select Pass or Fail'); return; }
    if (!id || !app) return;

    setSubmitting(true);
    const officerId = user?.uid || profile?.uid;
    const officerName = profile?.name || 'LMO Officer';

    try {
      if (result === 'pass') {
        const certId = generateCertId();
        const now = new Date();
        // Certificate valid for 1 year
        const validUntil = new Date(now);
        validUntil.setFullYear(validUntil.getFullYear() + 1);

        // Create certificate document
        await addDoc(collection(db, 'certificates'), {
          certificateNumber:  certId,
          applicationId:      app.applicationId || id,
          ownerId:            app.ownerId,
          ownerName:          app.ownerName || '',
          businessName:       app.businessName || '',
          instrumentId:       app.instrumentId || '',
          instrumentType:     app.instrumentType || '',
          serialNumber:       app.serialNumber || '',
          manufacturer:       instrument?.manufacturer || '',
          capacity:           instrument?.capacity || '',
          district:           app.district || '',
          officerId,
          officerName,
          verificationDate:   serverTimestamp(),
          validUntil:         validUntil.toISOString(),
          verificationType:   app.verificationType || 'initial',
          condition:          data.condition,
          sealStatus:         data.sealStatus,
          accuracyResult:     data.accuracyResult,
          zeroError:          data.zeroError || '',
          observations:       data.observations || '',
          inspectionDate:     data.inspectionDate,
          inspectionTime:     data.inspectionTime,
          location:           data.location || app.inspectionAddress || '',
          isValid:            true,
          isExpiring:         false,
          createdAt:          serverTimestamp(),
        });

        // Update application status
        await updateDoc(doc(db, 'applications', id), {
          status:          'certificate_generated',
          certificateId:   certId,
          updatedAt:       serverTimestamp(),
        });

        toast.success(`Instrument PASSED! Certificate ${certId} generated.`);
      } else {
        // Reject
        await updateDoc(doc(db, 'applications', id), {
          status:          'rejected',
          rejectionReason: data.rejectionReason || '',
          updatedAt:       serverTimestamp(),
        });
        toast.error('Instrument marked as FAILED. Rejection recorded.');
      }

      navigate('/lmo/applications');
    } catch (err) {
      console.error('[InspectionFormPage] submit error:', err);
      toast.error(`Submission failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </DashboardLayout>
    );
  }

  // Fallback display values if app couldn't be loaded
  const displayApp = app || { applicationId: id, instrumentType: 'Unknown', status: 'assigned', ownerName: '—', businessName: '—', serialNumber: '—', district: '—' };
  const displayInstrument = instrument || {};

  return (
    <DashboardLayout>
      <PageHeader
        title="Field Inspection Form"
        subtitle="Record on-site verification observations under the Legal Metrology Act, 2009"
        breadcrumbs={['Dashboard', 'Applications', 'Inspect']}
      />

      <div className="max-w-2xl space-y-6">
        {/* Instrument Info Glass Card */}
        <div className="p-6 transition-all duration-200 rounded-[28px] bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-400/35 backdrop-blur-2xl shadow-xs">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/25 border border-blue-500/20 dark:border-blue-400/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <Package size={22} />
              </div>
              <div>
                <div className="text-xs text-blue-600 dark:text-blue-200/70 uppercase tracking-wider font-semibold">Verification Subject</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">{displayApp.applicationId}</div>
                <div className="text-slate-700 dark:text-white/90 font-semibold text-sm">{displayApp.instrumentType}</div>
              </div>
            </div>
            <StatusBadge status={displayApp.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Owner</span><div className="text-slate-900 dark:text-white font-medium">{displayApp.ownerName}</div></div>
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Business</span><div className="text-slate-900 dark:text-white font-medium">{displayApp.businessName}</div></div>
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Serial No.</span><div className="text-slate-900 dark:text-white font-medium font-mono">{displayApp.serialNumber}</div></div>
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Manufacturer</span><div className="text-slate-900 dark:text-white font-medium">{displayInstrument?.manufacturer || '—'}</div></div>
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Capacity</span><div className="text-slate-900 dark:text-white font-medium">{displayInstrument?.capacity || '—'}</div></div>
            <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">District</span><div className="text-slate-900 dark:text-white font-medium">{displayApp.district}</div></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Schedule & Location */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Schedule &amp; Location</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Inspection Date" required>
                <input {...register('inspectionDate', { required: true })} type="date" className="form-input" />
              </FormField>
              <FormField label="Inspection Time" required>
                <input {...register('inspectionTime', { required: true })} type="time" className="form-input" />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Site Address">
                  <input {...register('location')} className="form-input" defaultValue={displayInstrument?.address || displayApp.inspectionAddress || ''} />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-400/30 text-xs text-blue-700 dark:text-blue-200">
                  <MapPin size={15} className="text-blue-600 dark:text-blue-400" />
                  <span>GPS Geotagging will automatically lock location upon signature submission</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <PenLine size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Statutory Inspection Observations</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Physical Condition" required error={errors.condition?.message}>
                  <select {...register('condition', { required: 'Required' })} className="form-input">
                    <option value="">Select condition</option>
                    <option value="good">Good — No physical damage</option>
                    <option value="fair">Fair — Acceptable wear</option>
                    <option value="poor">Poor — Severe wear</option>
                    <option value="defective">Defective — Non-conforming</option>
                  </select>
                </FormField>

                <FormField label="Official Seal Status" required error={errors.sealStatus?.message}>
                  <select {...register('sealStatus', { required: 'Required' })} className="form-input">
                    <option value="">Select seal status</option>
                    <option value="intact">Intact — Verification seals present</option>
                    <option value="broken">Broken — Tampering detected</option>
                    <option value="absent">Absent — Initial seal required</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tolerance Test (Schedule VII)" required error={errors.accuracyResult?.message}>
                  <select {...register('accuracyResult', { required: 'Required' })} className="form-input">
                    <option value="">Select tolerance result</option>
                    <option value="within_tolerance">Within Maximum Permissible Error</option>
                    <option value="exceeded">Exceeds Permissible Error</option>
                  </select>
                </FormField>

                <FormField label="Zero Setting Error Check">
                  <select {...register('zeroError')} className="form-input">
                    <option value="">Select check</option>
                    <option value="nil">Nil — Conforming</option>
                    <option value="within_limit">Within Statutory Limit</option>
                    <option value="exceeds">Exceeds Limit</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Technical Observations">
                <textarea
                  {...register('observations')}
                  className="w-full min-h-[80px] p-3.5 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                  placeholder="Record repeatability, sensitivity, zero-drift, and standard weight tests"
                />
              </FormField>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
              <Camera size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Inspection Evidence Photos</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Front View', 'Nameplate', 'Verification Seal', 'Display Screen'].map(label => (
                <label
                  key={label}
                  className="rounded-2xl p-4 text-center border border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400/60 bg-slate-50 dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-white/10 cursor-pointer transition-all group"
                >
                  <Camera size={20} className="text-blue-600 dark:text-blue-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-semibold text-slate-800 dark:text-white">{label}</div>
                  <input type="file" accept="image/*" capture="environment" className="hidden" />
                </label>
              ))}
            </div>
          </div>

          {/* PASS / FAIL Decision */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Official Verification Decision</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setResult('pass')}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                  result === 'pass'
                    ? 'border-emerald-500 dark:border-emerald-400/80 bg-emerald-500/15 dark:bg-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_24px_rgba(16,185,129,0.35)] scale-[1.02]'
                    : 'border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-emerald-400/40'
                }`}
              >
                <CheckCircle size={36} className={result === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/40'} />
                <span className={`font-extrabold text-lg ${result === 'pass' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-white/60'}`}>PASS</span>
                <span className="text-xs text-center text-slate-500 dark:text-white/60">Conforms to Legal Metrology Standards. QR Certificate will be issued.</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('fail')}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                  result === 'fail'
                    ? 'border-rose-500 dark:border-rose-400/80 bg-rose-500/15 dark:bg-rose-500/25 shadow-[0_4px_20px_rgba(244,63,94,0.2)] dark:shadow-[0_0_24px_rgba(244,63,94,0.35)] scale-[1.02]'
                    : 'border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-rose-400/40'
                }`}
              >
                <XCircle size={36} className={result === 'fail' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-white/40'} />
                <span className={`font-extrabold text-lg ${result === 'fail' ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-white/60'}`}>FAIL</span>
                <span className="text-xs text-center text-slate-500 dark:text-white/60">Does not conform to statutory tolerances. Rejection notice will be sent.</span>
              </button>
            </div>

            {result === 'pass' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-400/30 rounded-2xl flex items-start gap-3"
              >
                <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-700 dark:text-emerald-200 leading-relaxed">
                  Upon submission, a 256-bit cryptographically verified digital certificate with embedded QR will be auto-generated and saved to Firestore.
                </div>
              </motion.div>
            )}

            {result === 'fail' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <FormField label="Reason for Statutory Rejection" required>
                  <textarea
                    {...register('rejectionReason', { required: result === 'fail' ? 'Required when failing' : false })}
                    className="w-full min-h-[80px] p-3.5 rounded-xl bg-white/80 dark:bg-white/10 border border-rose-400/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:ring-2 focus:ring-rose-500/30 outline-none text-sm transition-all"
                    placeholder="Specify the technical ground under the Legal Metrology Act, 2009"
                  />
                </FormField>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={saving}
              className="h-[52px] px-6 rounded-xl text-sm font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              type="submit"
              disabled={submitting || !result}
              className={`h-[52px] px-8 rounded-xl font-semibold text-white flex items-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer ${
                result === 'fail'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/40'
                  : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
              }`}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  <span>Processing Decision...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>{result === 'pass' ? 'Submit & Issue Certificate' : result === 'fail' ? 'Submit Rejection' : 'Select Decision First'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InspectionFormPage;
