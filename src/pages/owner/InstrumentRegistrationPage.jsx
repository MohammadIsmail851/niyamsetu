import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Cpu, CheckCircle, Camera, FileText, Loader } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, Spinner } from '@/components/shared';
import { INSTRUMENT_CATEGORIES, INDIAN_STATES, AP_TELANGANA_DISTRICTS } from '@/types/enums';
import { performOCRExtraction } from '@/services/ocrService';
import { useAuthStore } from '@/store';
import { generateAppId } from '@/utils';
import toast from 'react-hot-toast';

const InstrumentRegistrationPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      ownerName: profile?.name || '',
      businessName: profile?.businessName || '',
      gstNumber: profile?.gstNumber || '',
      address: profile?.address || '',
      district: '',
      state: 'Telangana',
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const result = await performOCRExtraction(file);
      if (result.success) {
        Object.entries(result.extracted).forEach(([k, v]) => setValue(k, v));
        setOcrResult(result);
        toast.success(`AI OCR extracted data with ${result.confidence}% confidence`);
      }
    } catch {
      toast.error('OCR extraction failed. Please fill fields manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // In production: addDocument('instruments', { ...data, ownerId: profile.uid })
      await new Promise(r => setTimeout(r, 1000));
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
        subtitle="Add a new weighing or measuring instrument for verification"
        breadcrumbs={['Dashboard', 'Instruments', 'Register']}
      />

      <div className="max-w-3xl space-y-5">
        {/* AI OCR Upload Card */}
        <div className="card border-2 border-dashed border-blue-200 bg-blue-50/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Cpu size={20} className="text-royal" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-0.5">AI Auto-Fill (OCR)</div>
              <div className="text-sm text-slate mb-3">Upload instrument nameplate photo to auto-extract details using AI</div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-outline btn-sm"
                  disabled={ocrLoading}
                >
                  <Camera size={14} />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {ocrLoading && (
                  <div className="flex items-center gap-2 text-sm text-royal">
                    <Loader size={14} className="animate-spin" />
                    Analyzing image...
                  </div>
                )}
                {ocrResult && (
                  <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                    <CheckCircle size={14} />
                    Extracted ({ocrResult.confidence}% confidence)
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            {photoPreview && (
              <img src={photoPreview} alt="Instrument" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Instrument Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">1</span>
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
                <input {...register('yearOfManufacture', { required: 'Required' })} className="form-input" type="number" placeholder="e.g. 2022" min="1990" max={new Date().getFullYear()} />
              </FormField>

              <FormField label="Purchase Date">
                <input {...register('purchaseDate')} className="form-input" type="date" />
              </FormField>
            </div>
          </div>

          {/* Owner / Business Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">2</span>
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
                <FormField label="Address" required error={errors.address?.message}>
                  <textarea {...register('address', { required: 'Required' })} className="form-input" rows={2} placeholder="Complete address with landmark" />
                </FormField>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">3</span>
              Supporting Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Purchase Invoice / Bill', 'Instrument Photograph', 'Calibration Certificate (if any)'].map(doc => (
                <div key={doc} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-royal transition-colors cursor-pointer">
                  <Upload size={20} className="text-slate mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-700">{doc}</div>
                  <div className="text-xs text-slate mt-1">PDF, JPG, PNG up to 5MB</div>
                  <input type="file" className="hidden" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => navigate('/owner/instruments')} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><Spinner size="sm" className="border-white border-t-transparent" /> Saving...</> : 'Register Instrument'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InstrumentRegistrationPage;
