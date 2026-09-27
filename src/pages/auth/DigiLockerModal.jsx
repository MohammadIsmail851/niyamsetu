import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, ExternalLink, FileText, User, Building } from 'lucide-react';
import { useAuthStore } from '@/store';
import { maskAadhaar } from '@/utils';

const STEPS = ['consent', 'fetching', 'review', 'done'];

const DigiLockerModal = ({ open, onClose }) => {
  const [step, setStep] = useState('consent');
  const [fetchedDocs, setFetchedDocs] = useState(null);
  const { setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleConsent = async () => {
    setStep('fetching');
    // Simulate fetch delay
    await new Promise(r => setTimeout(r, 2500));
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
    }, 1800);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep('consent'), 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold">DigiLocker</div>
            <div className="text-white/80 text-xs">Ministry of Electronics & IT, GoI</div>
          </div>
        </div>

        <div className="p-6">
          {/* CONSENT STEP */}
          {step === 'consent' && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText size={16} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">NIYAMSETU is requesting access</h3>
              </div>
              <p className="text-sm text-slate mb-4">
                To auto-fill your registration, NIYAMSETU will access your DigiLocker documents.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 space-y-2.5">
                <div className="text-xs font-semibold text-orange-800 mb-1">Documents to be accessed:</div>
                {[
                  { icon: User, label: 'Aadhaar Card', sub: 'Name, DOB, Address (masked)' },
                  { icon: Building, label: 'GST Certificate', sub: 'Business name, GSTIN' },
                  { icon: FileText, label: 'Udyam Registration', sub: 'MSME category details' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-orange-200">
                      <Icon size={14} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{label}</div>
                      <div className="text-xs text-slate">{sub}</div>
                    </div>
                    <CheckCircle size={14} className="ml-auto text-green-500" />
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-5 text-xs text-blue-700">
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                Your data is end-to-end encrypted. NIYAMSETU does not store your Aadhaar number.
              </div>

              <div className="flex gap-3">
                <button onClick={handleClose} className="btn btn-ghost flex-1">Deny</button>
                <button onClick={handleConsent} className="btn flex-1 bg-orange-500 hover:bg-orange-600 text-white">Allow Access</button>
              </div>
            </div>
          )}

          {/* FETCHING STEP */}
          {step === 'fetching' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
              <div className="text-center">
                <div className="font-semibold text-gray-800">Fetching your documents...</div>
                <div className="text-sm text-slate mt-1">Connecting to DigiLocker servers</div>
              </div>
              {['Verifying Aadhaar...', 'Fetching GST Certificate...', 'Fetching Udyam Registration...'].map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  {msg}
                </div>
              ))}
            </div>
          )}

          {/* REVIEW STEP */}
          {step === 'review' && fetchedDocs && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-green-500" />
                <span className="font-semibold text-gray-900">Documents Verified</span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs font-semibold text-slate uppercase mb-2 flex items-center gap-1.5">
                    <User size={11} /> Aadhaar Details
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div><span className="text-slate text-xs">Name</span><div className="font-medium">{fetchedDocs.aadhaar.name}</div></div>
                    <div><span className="text-slate text-xs">Aadhaar No.</span><div className="font-medium font-mono">{fetchedDocs.aadhaar.number}</div></div>
                  </div>
                  <div className="text-xs text-slate mt-1 truncate">{fetchedDocs.aadhaar.address}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs font-semibold text-slate uppercase mb-2 flex items-center gap-1.5">
                    <Building size={11} /> Business Details
                  </div>
                  <div className="text-sm font-medium">{fetchedDocs.gst.businessName}</div>
                  <div className="text-xs text-slate font-mono">{fetchedDocs.gst.number}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleClose} className="btn btn-ghost flex-1">Cancel</button>
                <button onClick={handleConfirm} className="btn btn-primary flex-1">Confirm & Login</button>
              </div>
            </div>
          )}

          {/* DONE STEP */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <div className="font-semibold text-gray-900 text-lg">Logged In!</div>
              <div className="text-sm text-slate">Redirecting to your dashboard...</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DigiLockerModal;
