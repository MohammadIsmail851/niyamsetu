import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, FileText, User, Building } from 'lucide-react';
import { useAuthStore } from '@/store';

const DigiLockerModal = ({ open, onClose }) => {
  const [step, setStep] = useState('consent');
  const [fetchedDocs, setFetchedDocs] = useState(null);
  const { setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleConsent = async () => {
    setStep('fetching');
    await new Promise(r => setTimeout(r, 2000));
    setFetchedDocs({
      aadhaar: { number: '9876 XXXX XXXX 4321', name: 'Suresh Venkata Rao', dob: '1982-04-15', address: '12/3, Gandhi Nagar, Hyderabad - 500001' },
      gst: { number: '36AADCS5678N1Z2', businessName: 'Sri Venkata Weighing Solutions', registrationDate: '2019-07-01' },
      udyam: { number: 'UDYAM-TS-18-0012345', category: 'Micro Enterprise' },
    });
    setStep('review');
  };

  const handleConfirm = () => {
    const mockUid = `digilocker-${Date.now()}`;
    setUser({ uid: mockUid, email: 'suresh@srivenkata.com' });
    setProfile({
      uid: mockUid,
      email: 'suresh@srivenkata.com',
      name: 'Suresh Venkata Rao',
      role: 'business_owner',
      phone: '+91 98765 11223',
      digilockerVerified: true,
      aadhaarMasked: fetchedDocs.aadhaar.number,
      gstNumber: fetchedDocs.gst.number,
      businessName: fetchedDocs.gst.businessName,
      address: fetchedDocs.aadhaar.address,
    });
    setStep('done');
    setTimeout(() => {
      onClose();
      setStep('consent');
      navigate('/owner/dashboard');
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep('consent'), 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-[#04142F]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-[28px] overflow-hidden text-slate-800 dark:text-white bg-white/95 dark:bg-[#081a3c]/95 border border-slate-200 dark:border-white/20 shadow-2xl backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base">DigiLocker Integration</div>
            <div className="text-white/80 text-xs">Ministry of Electronics & IT, GoI</div>
          </div>
        </div>

        <div className="p-6">
          {/* CONSENT STEP */}
          {step === 'consent' && (
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/15 dark:bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <FileText size={16} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">NIYAMSETU requests access</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-white/70 mb-4 leading-relaxed">
                To auto-fill your statutory business verification details, NIYAMSETU will access your verified DigiLocker documents.
              </p>

              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 mb-4 space-y-3">
                <div className="text-xs font-semibold text-orange-600 dark:text-orange-300 uppercase tracking-wider mb-1">Documents to be accessed:</div>
                {[
                  { icon: User, label: 'Aadhaar Card', sub: 'Name, DOB, Address (masked)' },
                  { icon: Building, label: 'GST Certificate', sub: 'Business name, GSTIN' },
                  { icon: FileText, label: 'Udyam Registration', sub: 'MSME category details' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/15 shadow-xs">
                      <Icon size={14} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-white/50">{sub}</div>
                    </div>
                    <CheckCircle size={15} className="ml-auto text-emerald-500 dark:text-emerald-400" />
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-400/30 rounded-xl mb-5 text-xs text-blue-700 dark:text-blue-200">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <span>Your data is end-to-end encrypted. NIYAMSETU adheres to statutory data protection standards.</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-[46px] px-5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex-1 transition-all cursor-pointer"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={handleConsent}
                  className="h-[46px] px-5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-[0_4px_14px_rgba(249,115,22,0.35)] dark:shadow-[0_0_20px_rgba(249,115,22,0.4)] flex-1 transition-all cursor-pointer"
                >
                  Allow Access
                </button>
              </div>
            </div>
          )}

          {/* FETCHING STEP */}
          {step === 'fetching' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              <div className="text-center">
                <div className="font-bold text-slate-900 dark:text-white text-base">Fetching verified documents...</div>
                <div className="text-xs text-slate-500 dark:text-white/60 mt-1">Connecting to official DigiLocker gateway</div>
              </div>
              {['Verifying Aadhaar...', 'Fetching GST Certificate...', 'Fetching Udyam Registration...'].map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {/* REVIEW STEP */}
          {step === 'review' && fetchedDocs && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-emerald-500 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white text-sm">Documents Successfully Verified</span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={12} className="text-orange-500 dark:text-orange-400" /> Aadhaar Record
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Name</span><div className="font-semibold text-slate-900 dark:text-white">{fetchedDocs.aadhaar.name}</div></div>
                    <div><span className="text-slate-500 dark:text-white/50 block mb-0.5">Aadhaar No.</span><div className="font-mono text-blue-600 dark:text-blue-300 font-semibold">{fetchedDocs.aadhaar.number}</div></div>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-white/60 mt-2 truncate">{fetchedDocs.aadhaar.address}</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building size={12} className="text-orange-500 dark:text-orange-400" /> Business Record
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{fetchedDocs.gst.businessName}</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-300 font-mono mt-0.5">{fetchedDocs.gst.number}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-[46px] px-5 rounded-xl text-xs font-semibold text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex-1 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="h-[46px] px-5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex-1 transition-all cursor-pointer"
                >
                  Confirm & Login
                </button>
              </div>
            </div>
          )}

          {/* DONE STEP */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                <CheckCircle size={32} />
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-lg">Verified & Logged In!</div>
              <div className="text-xs text-slate-500 dark:text-white/60">Redirecting to your dashboard...</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DigiLockerModal;
