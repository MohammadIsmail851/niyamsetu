import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Cpu, Camera, Upload, CheckCircle, ArrowRight, Loader
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, Spinner } from '@/components/shared';
import { runOCR } from '@/services/ocrService';
import { useAuthStore } from '@/store';
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

const InstrumentRegistrationPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const fileRef = useRef(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ownerName: profile?.name || '',
      businessName: profile?.businessName || '',
      state: profile?.state || 'Telangana',
      district: profile?.district || 'Hyderabad',
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
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

  const onSubmit = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      toast.success('Instrument registered successfully!');
      navigate('/owner/instruments');
    } catch {
      toast.error('Failed to register. Please try again.');
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
        <div
          className="p-6 transition-all duration-200 rounded-[28px] bg-gradient-to-r from-blue-50 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/40 border-1.5 border-dashed border-blue-300 dark:border-blue-400/45 backdrop-blur-2xl shadow-xs"
        >
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
                  onClick={() => fileRef.current?.click()}
                  className="h-[42px] px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/40 flex items-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.3)] dark:shadow-[0_0_16px_rgba(37,99,235,0.4)] transition-all hover:scale-105 cursor-pointer"
                  disabled={ocrLoading}
                >
                  <Camera size={15} />
                  <span>{photoPreview ? 'Change Photo' : 'Upload Nameplate Photo'}</span>
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
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            {photoPreview && (
              <img src={photoPreview} alt="Instrument" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/20 shadow-md" />
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
              Owner & Business Details
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
              {['Purchase Invoice / Bill', 'Instrument Photograph', 'Calibration Certificate'].map(doc => (
                <div
                  key={doc}
                  className="rounded-2xl p-4 text-center border border-dashed border-slate-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-blue-400/60 bg-slate-50 dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <Upload size={22} className="text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-semibold text-slate-800 dark:text-white">{doc}</div>
                  <div className="text-[11px] text-slate-500 dark:text-white/50 mt-1">PDF, JPG up to 5MB</div>
                  <input type="file" className="hidden" />
                </div>
              ))}
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
