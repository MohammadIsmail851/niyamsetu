import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Upload, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, Spinner } from '@/components/shared';
import { db } from '@/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store';
import { generateAppId } from '@/utils';
import toast from 'react-hot-toast';

const VERIFICATION_TYPES = [
  { value: 'initial',     label: 'Initial Verification (New Instrument)' },
  { value: 'periodical',  label: 'Periodical Re-verification (Annual)' },
  { value: 're_verification', label: 'Re-verification after Repair / Modification' },
];

const NewApplicationPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const ownerId = user?.uid || profile?.uid;
  const preselectedInstrument = searchParams.get('instrument');
  const [instruments, setInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatedId] = useState(generateAppId);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { instrumentId: preselectedInstrument || '' }
  });

  useEffect(() => {
    if (!ownerId) { setLoadingInstruments(false); return; }
    const q = query(collection(db, 'instruments'), where('ownerId', '==', ownerId));
    const unsub = onSnapshot(
      q,
      snap => { setInstruments(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoadingInstruments(false); },
      () => { setInstruments([]); setLoadingInstruments(false); },
    );
    return () => unsub();
  }, [ownerId]);

  const onSubmit = async (data) => {
    if (!ownerId) { toast.error('Session expired. Please log in again.'); return; }
    setSaving(true);
    try {
      const selectedInstrument = instruments.find(i => i.id === data.instrumentId);
      await addDoc(collection(db, 'applications'), {
        applicationId:    generatedId,
        ownerId,
        ownerName:        profile?.name || '',
        businessName:     profile?.businessName || '',
        instrumentId:     data.instrumentId,
        instrumentType:   selectedInstrument?.instrumentType || '',
        serialNumber:     selectedInstrument?.serialNumber   || '',
        manufacturer:     selectedInstrument?.manufacturer   || '',
        capacity:         selectedInstrument?.capacity       || '',
        district:         selectedInstrument?.district || profile?.district || '',
        verificationType: data.verificationType,
        preferredDate:    data.preferredDate,
        inspectionAddress: data.inspectionAddress || '',
        remarks:          data.remarks || '',
        status:           'submitted',
        submittedAt:      serverTimestamp(),
        updatedAt:        serverTimestamp(),
      });
      toast.success(`Application ${generatedId} submitted successfully!`);
      navigate('/owner/applications');
    } catch (err) {
      console.error('[NewApplicationPage] submit error:', err);
      toast.error(`Submission failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const selectedInstrumentId = watch('instrumentId');
  const selectedInstrument = instruments.find(i => i.id === selectedInstrumentId);

  return (
    <DashboardLayout>
      <PageHeader
        title="New Verification Application"
        subtitle="Submit a formal statutory verification request for your weighing or measuring instrument"
        breadcrumbs={['Dashboard', 'Applications', 'New']}
      />

      <div className="max-w-2xl space-y-6">
        {/* App ID Glass Banner */}
        <div
          className="p-5 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-400/35 backdrop-blur-xl shadow-xs"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-500/25 border border-blue-500/20 dark:border-blue-400/40 flex items-center justify-center text-blue-600 dark:text-blue-300">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-xs text-blue-600 dark:text-blue-200/70 uppercase tracking-wider font-semibold">Application Reference Number</div>
            <div className="font-bold text-slate-900 dark:text-white font-mono text-xl tracking-wide">{generatedId}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Instrument Selection */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">1</span>
              Select Instrument
            </h3>
            <FormField label="Registered Instrument" required error={errors.instrumentId?.message}>
              <select {...register('instrumentId', { required: 'Please select an instrument' })} className="form-input" disabled={loadingInstruments}>
                <option value="">{loadingInstruments ? 'Loading instruments...' : 'Select registered instrument'}</option>
                {instruments.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.instrumentType} — SN: {i.serialNumber} ({i.manufacturer})
                  </option>
                ))}
              </select>
            </FormField>

            {selectedInstrument && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs"
              >
                <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Manufacturer</span><div className="font-semibold text-slate-900 dark:text-white">{selectedInstrument.manufacturer}</div></div>
                <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Model</span><div className="font-semibold text-slate-900 dark:text-white">{selectedInstrument.modelNumber}</div></div>
                <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Capacity</span><div className="font-semibold text-slate-900 dark:text-white">{selectedInstrument.capacity}</div></div>
                <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">District</span><div className="font-semibold text-slate-900 dark:text-white">{selectedInstrument.district}</div></div>
              </motion.div>
            )}
          </div>

          {/* Section 2: Application Details */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">2</span>
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Verification Type" required error={errors.verificationType?.message}>
                <select {...register('verificationType', { required: 'Required' })} className="form-input">
                  <option value="">Select verification type</option>
                  {VERIFICATION_TYPES.map(v => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Preferred Inspection Date" required error={errors.preferredDate?.message}>
                <input
                  {...register('preferredDate', { required: 'Required' })}
                  type="date"
                  className="form-input"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Inspection Site Address" required error={errors.inspectionAddress?.message}>
                  <textarea
                    {...register('inspectionAddress', { required: 'Required' })}
                    className="w-full min-h-[80px] p-3.5 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    placeholder="Enter site location where the Legal Metrology Officer will conduct inspection"
                    defaultValue={selectedInstrument?.address || ''}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Remarks (Optional)">
                  <textarea
                    {...register('remarks')}
                    className="w-full min-h-[70px] p-3.5 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    placeholder="Special timing preferences or site instructions"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Section 3: Documents */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">3</span>
              Supporting Documents
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Previous Certificate', 'Instrument Photograph', 'Business License', 'Calibration Report'].map(doc => (
                <label
                  key={doc}
                  className="rounded-2xl p-4 text-center border border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400/60 bg-slate-50 dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-white/10 cursor-pointer transition-all group"
                >
                  <Upload size={18} className="text-blue-600 dark:text-blue-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-semibold text-slate-800 dark:text-white">{doc}</div>
                  <input type="file" className="hidden" />
                </label>
              ))}
            </div>
          </div>

          {/* Statutory Declaration */}
          <div
            className="p-5 rounded-2xl bg-slate-50 dark:bg-white/6 border border-slate-200 dark:border-white/14"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('declaration', { required: 'You must accept the statutory declaration' })}
                className="mt-1 rounded accent-blue-600 w-4 h-4"
              />
              <span className="text-xs sm:text-sm text-slate-700 dark:text-white/80 leading-relaxed">
                I hereby declare that all information furnished above is authentic and the instruments conform to standards prescribed under the Legal Metrology (General) Rules, 2011.
              </span>
            </label>
            {errors.declaration && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{errors.declaration.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate('/owner/applications')}
              className="h-[52px] px-6 rounded-xl text-sm font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[52px] px-8 rounded-xl font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.55)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="border-white border-t-transparent" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewApplicationPage;
