import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Calendar, CheckCircle, Upload } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, FormField, Spinner } from '@/components/shared';
import { MOCK_INSTRUMENTS } from '@/data/mockData';
import { VERIFICATION_TYPES } from '@/types/enums';
import { generateAppId } from '@/utils';
import toast from 'react-hot-toast';

const NewApplicationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstrument = searchParams.get('instrument');
  const [saving, setSaving] = useState(false);
  const [generatedId] = useState(generateAppId());

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { instrumentId: preselectedInstrument || '' }
  });

  const onSubmit = async (data) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success(`Application ${generatedId} submitted successfully!`);
    navigate('/owner/applications');
    setSaving(false);
  };

  const selectedInstrumentId = watch('instrumentId');
  const selectedInstrument = MOCK_INSTRUMENTS.find(i => i.id === selectedInstrumentId);

  return (
    <DashboardLayout>
      <PageHeader
        title="New Verification Application"
        subtitle="Submit a verification request for your instrument"
        breadcrumbs={['Dashboard', 'Applications', 'New']}
      />

      <div className="max-w-2xl space-y-5">
        {/* App ID Banner */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <FileText size={18} className="text-royal" />
          <div>
            <div className="text-xs text-slate">Application ID (Auto-generated)</div>
            <div className="font-bold text-royal font-mono text-lg">{generatedId}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Instrument Selection */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">1</span>
              Select Instrument
            </h3>
            <FormField label="Registered Instrument" required error={errors.instrumentId?.message}>
              <select {...register('instrumentId', { required: 'Please select an instrument' })} className="form-input">
                <option value="">Select instrument</option>
                {MOCK_INSTRUMENTS.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.instrumentType} — {i.serialNumber} ({i.manufacturer})
                  </option>
                ))}
              </select>
            </FormField>

            {selectedInstrument && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-gray-50 rounded-xl grid grid-cols-2 gap-2 text-sm"
              >
                <div><span className="text-slate text-xs">Manufacturer</span><div className="font-medium">{selectedInstrument.manufacturer}</div></div>
                <div><span className="text-slate text-xs">Model</span><div className="font-medium">{selectedInstrument.modelNumber}</div></div>
                <div><span className="text-slate text-xs">Capacity</span><div className="font-medium">{selectedInstrument.capacity}</div></div>
                <div><span className="text-slate text-xs">District</span><div className="font-medium">{selectedInstrument.district}</div></div>
              </motion.div>
            )}
          </div>

          {/* Application Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">2</span>
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Verification Type" required error={errors.verificationType?.message}>
                <select {...register('verificationType', { required: 'Required' })} className="form-input">
                  <option value="">Select type</option>
                  {VERIFICATION_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
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
                <FormField label="Inspection Address" required error={errors.inspectionAddress?.message}>
                  <textarea
                    {...register('inspectionAddress', { required: 'Required' })}
                    className="form-input"
                    rows={2}
                    placeholder="Where should the officer visit for inspection?"
                    defaultValue={selectedInstrument?.address || ''}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Remarks (Optional)">
                  <textarea {...register('remarks')} className="form-input" rows={2} placeholder="Any special remarks or requirements" />
                </FormField>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-royal text-white text-xs flex items-center justify-center font-bold">3</span>
              Supporting Documents
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Previous Certificate (if any)', 'Instrument Photograph', 'Business License', 'Other Document'].map(doc => (
                <label key={doc} className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-royal cursor-pointer transition-colors">
                  <Upload size={18} className="text-slate mx-auto mb-1" />
                  <div className="text-xs font-medium text-gray-700">{doc}</div>
                  <input type="file" className="hidden" />
                </label>
              ))}
            </div>
          </div>

          {/* Declaration */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('declaration', { required: 'You must accept the declaration' })} className="mt-0.5" />
              <span className="text-sm text-gray-700">
                I hereby declare that all information furnished above is true and correct to the best of my knowledge, 
                as required under the Legal Metrology (General) Rules, 2011.
              </span>
            </label>
            {errors.declaration && <p className="form-error mt-1">{errors.declaration.message}</p>}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button type="button" onClick={() => navigate('/owner/applications')} className="btn btn-ghost">Cancel</button>
            <button type="button" onClick={() => toast('Draft saved')} className="btn btn-outline">Save Draft</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <><Spinner size="sm" className="border-white border-t-transparent" /> Submitting...</> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewApplicationPage;
