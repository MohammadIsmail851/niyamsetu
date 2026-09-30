import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Cpu, Camera, Upload, CheckCircle, ArrowRight, X, FileText, Image
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, Spinner } from '@/components/shared';
import { runOCR } from '@/services/ocrService';
import { useAuthStore } from '@/store';
import { db } from '@/firebase';
import {
  collection, addDoc, serverTimestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const INSTRUMENT_CATEGORIES = [
  'Electronic Weighing Scale (Class I/II/III)',
  'Mechanical Platform Scale',
  'Weighbridge (Static / In-Motion)',
  'Fuel Dispensing Unit (Petrol/Diesel)',
  'CNG Dispenser Flow Meter',
  'LPG Flow Meter / Dispenser',
  'Storage Tank Calibration',
  'Automatic Gravimetric Filling Instrument',
  'Length Measuring Instrument',
  'Water Meter / Liquid Measuring Device',
];

const INDIAN_STATES = ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Other'];
const AP_TELANGANA_DISTRICTS = [
  'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal', 'Karimnagar',
  'Nizamabad', 'Khammam', 'Nalgonda', 'Mahabubnagar', 'Sangareddy',
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool',
];

// ── FileUploadSlot (UI visible, upload optional / coming soon) ───────────────
const FileUploadSlot = ({ label, accept, previewType, file, preview, onSelect, onClear }) => {
  const inputRef = useRef(null);

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 overflow-hidden transition-all hover:border-blue-500 dark:hover:border-blue-400/60">
      {/* Preview area */}
      {file ? (
        <div className="relative p-3">
          {previewType === 'image' && preview ? (
            <img src={preview} alt={label} className="w-full h-28 object-cover rounded-xl" />
          ) : (
            <div className="w-full h-28 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <FileText size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-5 right-5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-400 transition-colors"
          >
            <X size={12} />
          </button>
          <div className="mt-2 text-[11px] text-slate-600 dark:text-white/70 truncate font-medium">{file.name}</div>
          <div className="mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Upload feature coming soon (Optional)
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full p-4 flex flex-col items-center gap-2 cursor-pointer group"
        >
          {previewType === 'image'
            ? <Image size={22} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            : <Upload size={22} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          }
          <div className="text-xs font-semibold text-slate-800 dark:text-white text-center">{label}</div>
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
            Upload feature coming soon
          </span>
          <div className="text-[11px] text-slate-500 dark:text-white/50">
            Optional
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onSelect}
      />
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const InstrumentRegistrationPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuthStore();
  const nameplateRef = useRef(null); // for OCR upload button

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── File states ─────────────────────────────────────────────────────────
  const [instrumentPhotoFile, setInstrumentPhotoFile]   = useState(null);
  const [instrumentPhotoPreview, setInstrumentPhotoPreview] = useState(null);
  const [instrumentPhotoProgress, setInstrumentPhotoProgress] = useState(0);

  const [nameplatePhotoFile, setNameplatePhotoFile]   = useState(null);
  const [nameplatePhotoPreview, setNameplatePhotoPreview] = useState(null);
  const [nameplatePhotoProgress, setNameplatePhotoProgress] = useState(0);

  const [calibrationCertFile, setCalibrationCertFile]   = useState(null);
  const [calibrationCertPreview, setCalibrationCertPreview] = useState(null);
  const [calibrationCertProgress, setCalibrationCertProgress] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ownerName:    profile?.name || '',
      businessName: profile?.businessName || '',
      state:        profile?.state || 'Telangana',
      district:     profile?.district || 'Hyderabad',
    }
  });

  // ── File select helpers ─────────────────────────────────────────────────
  const makeFileSelector = useCallback((setFile, setPreview, resetProgress) => (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    resetProgress(0);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    e.target.value = ''; // reset so same file can be re-selected
  }, []);

  // ── OCR upload ──────────────────────────────────────────────────────────
  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNameplatePhotoFile(file);
    setNameplatePhotoPreview(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const result = await runOCR(file);
      setOcrResult(result);
      if (result.manufacturer) setValue('manufacturer', result.manufacturer);
      if (result.modelNumber)  setValue('modelNumber', result.modelNumber);
      if (result.serialNumber) setValue('serialNumber', result.serialNumber);
      if (result.capacity)     setValue('capacity', result.capacity);
      if (result.accuracy)     setValue('accuracy', result.accuracy);
      if (result.category)     setValue('category', result.category);
      if (result.year)         setValue('yearOfManufacture', result.year);
      toast.success('AI OCR Auto-Fill completed!');
    } catch {
      toast.error('Could not extract details. Please fill manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  // ── Submit: validate → Firestore (no Storage upload) ───────────────────
  const onSubmit = async (data) => {
    const ownerId = user?.uid || profile?.uid;
    if (!ownerId) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'instruments'), {
        ownerId,
        ownerName:                 data.ownerName || '',
        businessName:              data.businessName || '',
        instrumentType:            data.instrumentType || '',
        category:                  data.category || '',
        manufacturer:              data.manufacturer || '',
        modelNumber:               data.modelNumber || '',
        model:                     data.modelNumber || '',
        serialNumber:              data.serialNumber || '',
        capacity:                  data.capacity || '',
        accuracy:                  data.accuracy || '',
        year:                      data.yearOfManufacture || '',
        purchaseDate:              data.purchaseDate || '',
        state:                     data.state || '',
        district:                  data.district || '',
        pinCode:                   data.pincode || '',
        address:                   data.address || '',
        instrumentPhotoURL:        '',
        nameplatePhotoURL:         '',
        calibrationCertificateURL: '',
        status:                    'Registered',
        createdAt:                 serverTimestamp(),
        updatedAt:                 serverTimestamp(),
      });

      console.log('[NIYAMSETU] Instrument created in Firestore:', docRef.id);
      toast.success('Instrument registered successfully!');
      navigate('/owner/instruments');
    } catch (err) {
      console.error('[NIYAMSETU] Registration failed:', err);
      const errMsg = err?.code ? `[${err.code}] ${err.message}` : (err?.message || 'Registration failed');
      toast.error(`Registration failed: ${errMsg}`, { duration: 6000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Register Instrument"
        subtitle="Add a new weighing or measuring instrument for statutory legal metrology verification"
        breadcrumbs={['Dashboard', 'Instruments', 'Register']}
      />

      <div className="max-w-3xl space-y-6">
        {/* AI OCR Upload Glass Card */}
        <div className="p-6 transition-all duration-200 rounded-[28px] bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40 border-1.5 border-dashed border-blue-300 dark:border-blue-400/45 backdrop-blur-2xl shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-400/30 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 shadow-xs">
              <Cpu size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-900 dark:text-white text-base mb-1">AI Auto-Fill (OCR)</div>
              <div className="text-xs text-slate-600 dark:text-white/70 mb-4 leading-relaxed">
                Upload instrument nameplate photo to auto-extract manufacturer, serial, model, and capacity details using AI.
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => nameplateRef.current?.click()}
                  className="h-[42px] px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/40 flex items-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.3)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 cursor-pointer"
                  disabled={ocrLoading}
                >
                  <Camera size={15} />
                  <span>{nameplatePhotoFile ? 'Change Nameplate Photo' : 'Upload Nameplate Photo'}</span>
                </button>
                {ocrLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300 font-medium">
                    <Loader size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                    <span>Analyzing instrument photo...</span>
                  </div>
                )}
                {ocrResult && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full">
                    <CheckCircle size={14} />
                    <span>Extracted ({ocrResult.confidence}% confidence)</span>
                  </div>
                )}
              </div>
              <input ref={nameplateRef} type="file" accept="image/*" className="hidden" onChange={handleOcrUpload} />
            </div>
            {nameplatePhotoPreview && (
              <img src={nameplatePhotoPreview} alt="Nameplate" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/20 shadow-md" />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Instrument Details */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">1</span>
              Instrument Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Instrument Type" required error={errors.instrumentType?.message}>
                <select {...register('instrumentType', { required: 'Required' })} className="form-input">
                  <option value="">Select type</option>
                  {INSTRUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>

              <FormField label="Category" required error={errors.category?.message}>
                <input {...register('category', { required: 'Required' })} className="form-input" placeholder="e.g. Weighing Scale" />
              </FormField>

              <FormField label="Manufacturer" required error={errors.manufacturer?.message}>
                <input {...register('manufacturer', { required: 'Required' })} className="form-input" placeholder="e.g. Mettler Toledo" />
              </FormField>

              <FormField label="Model Number" required error={errors.modelNumber?.message}>
                <input {...register('modelNumber', { required: 'Required' })} className="form-input" placeholder="e.g. ME204E" />
              </FormField>

              <FormField label="Serial Number" required error={errors.serialNumber?.message}>
                <input {...register('serialNumber', { required: 'Required' })} className="form-input" placeholder="Unique serial number" />
              </FormField>

              <FormField label="Capacity" required error={errors.capacity?.message}>
                <input {...register('capacity', { required: 'Required' })} className="form-input" placeholder="e.g. 220g, 500kg" />
              </FormField>

              <FormField label="Accuracy / Division">
                <input {...register('accuracy')} className="form-input" placeholder="e.g. 0.001g, 100g" />
              </FormField>

              <FormField label="Year of Manufacture" required error={errors.yearOfManufacture?.message}>
                <input {...register('yearOfManufacture', { required: 'Required' })} className="form-input" type="number" placeholder="e.g. 2024" min="1990" max={new Date().getFullYear()} />
              </FormField>

              <FormField label="Purchase Date">
                <input {...register('purchaseDate')} className="form-input" type="date" />
              </FormField>
            </div>
          </div>

          {/* Section 2: Owner & Business Details */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">2</span>
              Owner &amp; Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Owner Name" required error={errors.ownerName?.message}>
                <input {...register('ownerName', { required: 'Required' })} className="form-input" />
              </FormField>

              <FormField label="Business Name" required error={errors.businessName?.message}>
                <input {...register('businessName', { required: 'Required' })} className="form-input" />
              </FormField>

              <FormField label="GST Number">
                <input {...register('gstNumber')} className="form-input" placeholder="15-digit GSTIN" />
              </FormField>

              <FormField label="District" required error={errors.district?.message}>
                <select {...register('district', { required: 'Required' })} className="form-input">
                  <option value="">Select district</option>
                  {AP_TELANGANA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </FormField>

              <FormField label="State" required>
                <select {...register('state', { required: 'Required' })} className="form-input">
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>

              <FormField label="PIN Code">
                <input {...register('pincode')} className="form-input" placeholder="6-digit PIN" maxLength={6} />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Installation Address" required error={errors.address?.message}>
                  <textarea
                    {...register('address', { required: 'Required' })}
                    className="w-full min-h-[80px] p-3 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    placeholder="Complete address with landmark"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Section 3: Supporting Documents */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-600/40 border border-blue-500/20 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-bold">3</span>
              Supporting Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileUploadSlot
                label="Instrument Photo"
                accept="image/*"
                previewType="image"
                file={instrumentPhotoFile}
                preview={instrumentPhotoPreview}
                progress={instrumentPhotoProgress}
                onSelect={makeFileSelector(setInstrumentPhotoFile, setInstrumentPhotoPreview, setInstrumentPhotoProgress)}
                onClear={() => { setInstrumentPhotoFile(null); setInstrumentPhotoPreview(null); setInstrumentPhotoProgress(0); }}
              />
              <FileUploadSlot
                label="Nameplate Photo"
                accept="image/*"
                previewType="image"
                file={nameplatePhotoFile}
                preview={nameplatePhotoPreview}
                progress={nameplatePhotoProgress}
                onSelect={makeFileSelector(setNameplatePhotoFile, setNameplatePhotoPreview, setNameplatePhotoProgress)}
                onClear={() => { setNameplatePhotoFile(null); setNameplatePhotoPreview(null); setNameplatePhotoProgress(0); }}
              />
              <FileUploadSlot
                label="Calibration Certificate"
                accept="application/pdf,image/*"
                previewType="pdf"
                file={calibrationCertFile}
                preview={calibrationCertPreview}
                progress={calibrationCertProgress}
                onSelect={makeFileSelector(setCalibrationCertFile, setCalibrationCertPreview, setCalibrationCertProgress)}
                onClear={() => { setCalibrationCertFile(null); setCalibrationCertPreview(null); setCalibrationCertProgress(0); }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate('/owner/instruments')}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register Instrument</span>
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

export default InstrumentRegistrationPage;
