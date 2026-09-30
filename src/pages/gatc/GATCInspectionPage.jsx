import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, FlaskConical, Save, Loader } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, StatusBadge, Spinner } from '@/components/shared';
import { db } from '@/firebase';
import {
  doc, getDoc, updateDoc, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const GATCInspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const [decision, setDecision] = useState(null); // 'PASS' | 'FAIL'
  const [saving, setSaving] = useState(false);
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // ── Load application ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'applications', id));
        if (!snap.exists()) { toast.error('Application not found'); navigate('/gatc/tests'); return; }
        setApp({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error('[GATCInspectionPage] load error:', err);
        toast.error('Failed to load application.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Submit lab report ─────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!decision) { toast.error('Please select PASS or FAIL before submitting.'); return; }

    const gatcId = user?.uid || profile?.uid;
    setSaving(true);
    try {
      // 1. Create laboratory report document
      await addDoc(collection(db, 'laboratoryReports'), {
        applicationId: id,
        gatcId,
        gatcName: profile?.name || 'GATC Laboratory',
        labTestResult:       data.labTestResult || '',
        accuracyVerification: data.accuracyVerification || '',
        standardReference:   data.standardReference || '',
        remarks:             data.remarks || '',
        reportStatus:        decision,
        result:              decision,
        createdAt:           serverTimestamp(),
      });

      // 2. Update application status
      await updateDoc(doc(db, 'applications', id), {
        status:           decision === 'PASS' ? 'inspection_completed' : 'rejected',
        gatcReportResult: decision,
        gatcRemarks:      data.remarks || '',
        updatedAt:        serverTimestamp(),
      });

      toast.success(`Laboratory report submitted — ${decision}`);
      navigate('/gatc/tests');
    } catch (err) {
      console.error('[GATCInspectionPage] submit error:', err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!app) return null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Laboratory Inspection Form"
        subtitle={`Application — ${app.applicationId || app.id?.slice(0, 8)}`}
        breadcrumbs={['Dashboard', 'Tests', 'Enter Results']}
      />

      <div className="max-w-2xl space-y-6">
        {/* Application Summary */}
        <div className="p-6 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <FlaskConical size={16} className="text-blue-600 dark:text-blue-400" />
            Instrument Summary
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Instrument Type', app.instrumentType],
              ['Serial Number', app.serialNumber],
              ['Manufacturer', app.manufacturer],
              ['Capacity', app.capacity],
              ['Owner', app.ownerName],
              ['District', app.district],
              ['Status', null],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[11px] text-slate-500 dark:text-white/50 uppercase tracking-wider font-semibold mb-0.5">{label}</div>
                {label === 'Status'
                  ? <StatusBadge status={app.status} />
                  : <div className="text-slate-800 dark:text-white font-medium">{value || '—'}</div>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Lab Results Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">1</span>
              Laboratory Test Details
            </h3>

            <FormField label="Laboratory Test Result" required error={errors.labTestResult?.message}>
              <textarea
                {...register('labTestResult', { required: 'Required' })}
                rows={3}
                className="w-full p-3 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                placeholder="Describe the test results, readings, observations..."
              />
            </FormField>

            <FormField label="Accuracy Verification" required error={errors.accuracyVerification?.message}>
              <input
                {...register('accuracyVerification', { required: 'Required' })}
                className="form-input"
                placeholder="e.g. ±0.001g — within tolerance"
              />
            </FormField>

            <FormField label="Standard Reference Used" required error={errors.standardReference?.message}>
              <input
                {...register('standardReference', { required: 'Required' })}
                className="form-input"
                placeholder="e.g. IS 1435:2006, OIML R 76"
              />
            </FormField>

            <FormField label="Remarks">
              <textarea
                {...register('remarks')}
                rows={2}
                className="w-full p-3 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                placeholder="Additional remarks or observations..."
              />
            </FormField>
          </div>

          {/* Decision */}
          <div className="p-6 sm:p-8 mt-6 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">2</span>
              Final Decision
            </h3>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDecision('PASS')}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                  decision === 'PASS'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-white/15 text-slate-500 dark:text-white/50 hover:border-emerald-400 hover:text-emerald-600'
                }`}
              >
                <CheckCircle size={24} />
                PASS
                <span className="text-[11px] font-normal opacity-70">Instrument verified & compliant</span>
              </button>
              <button
                type="button"
                onClick={() => setDecision('FAIL')}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                  decision === 'FAIL'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-white/15 text-slate-500 dark:text-white/50 hover:border-rose-400 hover:text-rose-600'
                }`}
              >
                <XCircle size={24} />
                FAIL
                <span className="text-[11px] font-normal opacity-70">Does not meet standards</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/gatc/tests')}
              className="h-[48px] px-6 rounded-xl text-sm font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !decision}
              className="h-[48px] px-8 rounded-xl font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {saving ? (
                <><Spinner size="sm" className="border-white border-t-transparent" /><span>Submitting...</span></>
              ) : (
                <><Save size={16} /><span>Submit Report</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default GATCInspectionPage;
