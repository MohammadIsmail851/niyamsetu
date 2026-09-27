/**
 * DigiLockerModal
 * ─────────────────────────────────────────────────────────────────────────────
 * A fully-featured DigiLocker OAuth consent + document review modal.
 *
 * FLOW:
 *  1. consent  → User reads what NIYAMSETU is requesting
 *  2. auth     → Simulates DigiLocker authentication handshake
 *  3. fetching → Fetches verified documents from mock Pull API
 *  4. review   → User reviews fetched documents and confirms
 *  5. done     → Profile created / existing account matched, redirect
 *
 * Uses: src/services/digilocker.js  (no direct Firebase access here)
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle, User, Building2, FileCheck, ShieldCheck,
  Lock, AlertCircle, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import {
  initiateDigiLockerOAuth,
  exchangeDigiLockerToken,
  fetchDigiLockerDocuments,
  resolveDigiLockerUser,
  buildProfileFromDigiLocker,
} from '@/services/digilocker';
import digilockerLogo from '@/assets/digilocker-logo.jpg';

// ── Step definitions ─────────────────────────────────────────────────────────

const STEPS = ['consent', 'auth', 'fetching', 'review', 'done'];

const DOCS_REQUESTED = [
  {
    icon: User,
    label: 'Aadhaar Card',
    sub: 'Name, DOB, Address (last 4 digits only)',
    badge: 'UIDAI',
  },
  {
    icon: Building2,
    label: 'GST Registration Certificate',
    sub: 'Business name, GSTIN, registration date',
    badge: 'GSTN',
  },
  {
    icon: FileCheck,
    label: 'Udyam Registration',
    sub: 'MSME enterprise category',
    badge: 'MoMSME',
  },
];

// ── Main Component ───────────────────────────────────────────────────────────

const DigiLockerModal = ({ open, onClose }) => {
  const [step, setStep] = useState('consent');
  const [authData, setAuthData] = useState(null);   // { authCode, accessToken, userId }
  const [docs, setDocs]         = useState(null);
  const [error, setError]       = useState('');
  const [existingUser, setExistingUser] = useState(false);

  const { setUser, setProfile } = useAuthStore();
  const navigate = useNavigate();

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Step 1 → 2: User clicks "Continue with DigiLocker" */
  const handleConsent = useCallback(async () => {
    setError('');
    setStep('auth');
    try {
      const { authCode } = await initiateDigiLockerOAuth();
      const tokenData    = await exchangeDigiLockerToken(authCode);
      setAuthData({ authCode, ...tokenData });
      setStep('fetching');

      // Step 2 → 3: Fetch documents
      const fetchedDocs = await fetchDigiLockerDocuments(tokenData.accessToken);
      setDocs(fetchedDocs);

      // Check if user already exists
      const { exists, profile } = await resolveDigiLockerUser(
        tokenData.userId,
        fetchedDocs.aadhaar.name
      );
      setExistingUser(exists);
      setStep('review');
    } catch (err) {
      setError('DigiLocker authentication failed. Please try again.');
      setStep('consent');
    }
  }, []);

  /** Step 4 → 5: User clicks "Allow Access" on document review */
  const handleConfirm = useCallback(() => {
    if (!docs || !authData) return;
    const profile = buildProfileFromDigiLocker(authData.userId, docs);
    setUser({ uid: profile.uid, email: profile.email });
    setProfile(profile);
    setStep('done');
    setTimeout(() => {
      handleClose();
      navigate('/owner/dashboard');
    }, 1800);
  }, [docs, authData, setUser, setProfile, navigate]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('consent');
      setAuthData(null);
      setDocs(null);
      setError('');
      setExistingUser(false);
    }, 300);
  }, [onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 dark:bg-[#020d1f]/80 backdrop-blur-md"
          onClick={step !== 'auth' && step !== 'fetching' && step !== 'done' ? handleClose : undefined}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-[28px] overflow-hidden
                     bg-white/97 dark:bg-[#081a3c]/97
                     border border-slate-200 dark:border-white/15
                     shadow-[0_24px_60px_rgba(0,0,0,0.22)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)]
                     backdrop-blur-2xl text-slate-800 dark:text-white"
        >
          {/* ── DigiLocker Blue Header ────────────────────────────────────── */}
          <div className="bg-[#1565C0] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Official DigiLocker logo */}
              <div className="w-36 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden px-2 shadow-sm">
                <img
                  src={digilockerLogo}
                  alt="DigiLocker — Government of India"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>
            {step !== 'auth' && step !== 'fetching' && step !== 'done' && (
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Secure Government badge strip */}
          <div className="bg-[#1255A3] px-6 py-1.5 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[#7EC8FF]" />
            <span className="text-[11px] text-[#a8d8ff] font-medium tracking-wide">
              Secure Government Document Verification
            </span>
          </div>

          {/* ── Step Content ─────────────────────────────────────────────── */}
          <div className="p-6">
            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-xs text-red-700 dark:text-red-300">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* STEP: consent ───────────────────────────────────────────── */}
            {step === 'consent' && (
              <ConsentStep
                onAllow={handleConsent}
                onDeny={handleClose}
              />
            )}

            {/* STEP: auth (DigiLocker handshake) ──────────────────────── */}
            {step === 'auth' && (
              <LoadingStep
                title="Connecting to DigiLocker..."
                subtitle="Establishing secure channel with the official gateway"
                lines={[
                  'Initiating OAuth2 handshake…',
                  'Verifying DigiLocker session…',
                ]}
              />
            )}

            {/* STEP: fetching documents ───────────────────────────────── */}
            {step === 'fetching' && (
              <LoadingStep
                title="Fetching verified documents..."
                subtitle="Pulling documents from your DigiLocker account"
                lines={[
                  'Verifying Aadhaar (UIDAI)…',
                  'Fetching GST Certificate (GSTN)…',
                  'Fetching Udyam Registration (MoMSME)…',
                ]}
              />
            )}

            {/* STEP: review ────────────────────────────────────────────── */}
            {step === 'review' && docs && (
              <ReviewStep
                docs={docs}
                existingUser={existingUser}
                onConfirm={handleConfirm}
                onCancel={handleClose}
              />
            )}

            {/* STEP: done ──────────────────────────────────────────────── */}
            {step === 'done' && (
              <DoneStep existingUser={existingUser} />
            )}
          </div>

          {/* Footer */}
          {(step === 'consent' || step === 'review') && (
            <div className="px-6 pb-5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/35">
              <Lock size={11} />
              <span>
                Protected by DigiLocker · Ministry of Electronics & IT, GoI ·{' '}
                <a
                  href="https://digilocker.gov.in/privacy.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1565C0] dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Privacy Policy <ExternalLink size={9} />
                </a>
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

const ConsentStep = ({ onAllow, onDeny }) => (
  <div>
    {/* Requester identity */}
    <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <div className="w-10 h-10 rounded-xl bg-blue-600/15 dark:bg-blue-500/20 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
        <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">NIYAMSETU</div>
        <div className="text-[11px] text-slate-500 dark:text-white/50">
          National Legal Metrology Digital Portal
        </div>
      </div>
      <div className="ml-auto text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
        <CheckCircle size={9} /> Verified
      </div>
    </div>

    <p className="text-xs text-slate-600 dark:text-white/65 mb-4 leading-relaxed">
      NIYAMSETU is requesting access to your verified government documents stored in DigiLocker
      to auto-fill your business registration details. No document is stored without your consent.
    </p>

    {/* Documents requested */}
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden mb-4">
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1565C0] dark:text-blue-300">
          Documents requested
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {DOCS_REQUESTED.map(({ icon: Icon, label, sub, badge }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-[#1565C0] dark:text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">{label}</div>
              <div className="text-[11px] text-slate-500 dark:text-white/45 truncate">{sub}</div>
            </div>
            <span className="text-[9px] font-bold text-[#1565C0] dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {badge}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Security notice */}
    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/8 dark:bg-blue-500/12 border border-blue-500/20 mb-5 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
      <ShieldCheck size={13} className="flex-shrink-0 mt-0.5" />
      <span>
        Your data is end-to-end encrypted. NIYAMSETU complies with the IT Act 2000
        and the Legal Metrology Act 2009 on data protection.
      </span>
    </div>

    {/* Actions */}
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onDeny}
        className="flex-1 h-[46px] rounded-xl text-xs font-semibold
                   text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white
                   bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10
                   border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onAllow}
        className="flex-1 h-[46px] rounded-xl text-xs font-bold text-white
                   bg-[#1565C0] hover:bg-[#1255A3]
                   shadow-[0_4px_16px_rgba(21,101,192,0.40)] hover:shadow-[0_6px_20px_rgba(21,101,192,0.55)]
                   transition-all hover:scale-[1.02] active:scale-[0.99] cursor-pointer
                   flex items-center justify-center gap-2"
      >
        <ShieldCheck size={15} />
        Continue with DigiLocker
      </button>
    </div>
  </div>
);

const LoadingStep = ({ title, subtitle, lines }) => (
  <div className="flex flex-col items-center py-8 gap-5">
    {/* Animated DigiLocker spinner */}
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-[#1565C0]/20 dark:border-blue-500/20 border-t-[#1565C0] dark:border-t-blue-400 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <ShieldCheck size={20} className="text-[#1565C0] dark:text-blue-400" />
      </div>
    </div>
    <div className="text-center">
      <div className="font-bold text-slate-900 dark:text-white text-sm">{title}</div>
      <div className="text-[11px] text-slate-500 dark:text-white/50 mt-1">{subtitle}</div>
    </div>
    <div className="space-y-2 w-full">
      {lines.map((msg, i) => (
        <div key={i} className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-white/55">
          <div className="w-1.5 h-1.5 rounded-full bg-[#1565C0] dark:bg-blue-400 animate-pulse flex-shrink-0" />
          <span>{msg}</span>
        </div>
      ))}
    </div>
  </div>
);

const ReviewStep = ({ docs, existingUser, onConfirm, onCancel }) => (
  <div>
    {/* Success banner */}
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4">
      <CheckCircle size={16} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
      <div>
        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Documents verified successfully
        </div>
        <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70">
          {existingUser ? 'Existing account found — you will be logged in.' : 'A new Business Owner account will be created.'}
        </div>
      </div>
    </div>

    {/* Document cards */}
    <div className="space-y-2.5 mb-5">
      {/* Aadhaar */}
      <DocCard
        icon={User}
        title="Aadhaar Record"
        badge="UIDAI Verified"
        badgeColor="emerald"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <Field label="Name" value={docs.aadhaar.name} mono={false} />
          <Field label="Aadhaar No." value={docs.aadhaar.number} mono />
          <Field label="Address" value={docs.aadhaar.address} mono={false} className="col-span-2" />
        </div>
      </DocCard>

      {/* GST */}
      <DocCard
        icon={Building2}
        title="GST Certificate"
        badge="GSTN Verified"
        badgeColor="emerald"
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <Field label="Business" value={docs.gst.businessName} mono={false} className="col-span-2" />
          <Field label="GSTIN" value={docs.gst.number} mono />
          <Field label="Type" value={docs.gst.businessType} mono={false} />
        </div>
      </DocCard>

      {/* Udyam */}
      <DocCard
        icon={FileCheck}
        title="Udyam Registration"
        badge="MoMSME Verified"
        badgeColor="emerald"
      >
        <div className="text-xs">
          <Field label="Udyam No." value={docs.udyam.number} mono />
          <Field label="Category" value={docs.udyam.category} mono={false} className="mt-1.5" />
        </div>
      </DocCard>
    </div>

    {/* Actions */}
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-[46px] rounded-xl text-xs font-semibold
                   text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white
                   bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10
                   border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 h-[46px] rounded-xl text-xs font-bold text-white
                   bg-[#1565C0] hover:bg-[#1255A3]
                   shadow-[0_4px_16px_rgba(21,101,192,0.40)] hover:shadow-[0_6px_20px_rgba(21,101,192,0.55)]
                   transition-all hover:scale-[1.02] active:scale-[0.99] cursor-pointer
                   flex items-center justify-center gap-2"
      >
        <CheckCircle size={14} />
        Allow Access &amp; {existingUser ? 'Sign In' : 'Create Account'}
      </button>
    </div>
  </div>
);

const DoneStep = ({ existingUser }) => (
  <div className="flex flex-col items-center py-10 gap-4">
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="w-20 h-20 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center"
    >
      <CheckCircle size={36} className="text-emerald-500 dark:text-emerald-400" />
    </motion.div>
    <div className="text-center">
      <div className="font-bold text-slate-900 dark:text-white text-lg">
        {existingUser ? 'Welcome back!' : 'Account Created!'}
      </div>
      <div className="text-xs text-slate-500 dark:text-white/55 mt-1">
        DigiLocker verified · Redirecting to dashboard…
      </div>
    </div>
  </div>
);

// ── Micro-components ─────────────────────────────────────────────────────────

const DocCard = ({ icon: Icon, title, badge, badgeColor = 'emerald', children }) => {
  const badgeStyles = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue:    'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={12} className="text-[#1565C0] dark:text-blue-400 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
          {title}
        </span>
        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
};

const Field = ({ label, value, mono, className = '' }) => (
  <div className={className}>
    <span className="text-slate-400 dark:text-white/40 block mb-0.5 text-[10px]">{label}</span>
    <span className={`font-semibold text-slate-900 dark:text-white ${mono ? 'font-mono text-[#1565C0] dark:text-blue-300' : ''}`}>
      {value}
    </span>
  </div>
);

export default DigiLockerModal;
