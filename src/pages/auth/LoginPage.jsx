import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '@/firebase/auth';
import { fetchUserProfile } from '@/firebase/auth';
import { useAuthStore } from '@/store';
import DigiLockerModal from './DigiLockerModal';
import FloatingBlobs from '@/components/FloatingBlobs';
import ThemeToggle from '@/components/ThemeToggle';

const ROLE_DEMO = [
  { role: 'business_owner', email: 'business@test.com', label: 'Business Owner', altEmail: 'owner@demo.com' },
  { role: 'lmo',            email: 'lmo@test.com',      label: 'LM Officer',     altEmail: 'lmo@demo.com' },
  { role: 'gatc',           email: 'gatc@test.com',     label: 'GATC Lab',       altEmail: 'gatc@demo.com' },
  { role: 'admin',          email: 'admin@test.com',    label: 'Administrator',  altEmail: 'admin@demo.com' },
];

const ROLE_HOME = {
  business_owner: '/owner/dashboard',
  lmo: '/lmo/dashboard',
  gatc: '/gatc/dashboard',
  admin: '/admin/dashboard',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [digiOpen, setDigiOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const onSubmit = async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      const profile = await fetchUserProfile(user.uid);
      setUser(user);
      setProfile(profile);
      navigate(ROLE_HOME[profile?.role] || '/owner/dashboard');
    } catch {
      // Demo mode fallback: verify configured demo test accounts
      const demo = ROLE_DEMO.find(r => r.email.toLowerCase() === email.toLowerCase() || r.altEmail === email.toLowerCase());
      if (demo) {
        const mockProfile = { uid: `mock-${demo.role}`, email, role: demo.role, name: demo.label };
        setUser({ uid: mockProfile.uid, email });
        setProfile(mockProfile);
        navigate(ROLE_HOME[demo.role]);
      } else {
        setError('Invalid credentials. Use demo accounts: business@test.com / Test@123');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      const user = await loginWithGoogle();
      const profile = await fetchUserProfile(user.uid);
      setUser(user);
      setProfile(profile || { uid: user.uid, role: 'business_owner', name: user.displayName });
      navigate('/owner/dashboard');
    } catch {
      setError('Google sign-in unavailable in demo environment.');
    }
  };

  const handleDemoLogin = (demo) => {
    setValue('email', demo.email);
    setValue('password', 'Test@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] text-slate-800 dark:text-white flex flex-col relative overflow-x-hidden transition-colors duration-300">
      {/* Ambient floating blue light blobs */}
      <FloatingBlobs />

      {/* Top Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-white/10 backdrop-blur-md border border-blue-500/20 dark:border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Shield size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-slate-900 dark:text-white font-bold text-base tracking-wide">NIYAMSETU</div>
            <div className="text-blue-600 dark:text-white/50 text-[10px] tracking-wider uppercase font-semibold">Legal Metrology Portal</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/register"
            className="text-xs text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md transition-all font-medium"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full rounded-[28px] p-6 sm:p-8 bg-white/75 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            {/* Header: Shield icon, NIYAMSETU */}
            <div className="text-center mb-6">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/15 to-blue-400/10 dark:from-blue-600/40 dark:to-blue-400/20 border border-blue-500/25 dark:border-blue-400/30 items-center justify-center mb-3 shadow-[0_0_24px_rgba(37,99,235,0.2)] dark:shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                <Shield size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                NIYAMSETU
              </h1>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-200/80 font-medium mt-1">
                Legal Metrology Verification Platform
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 rounded-xl mb-5 text-sm text-red-700 dark:text-red-200">
                <AlertCircle size={17} className="flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative w-full">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Valid email required' }
                    })}
                    type="email"
                    className="w-full h-[52px] rounded-xl pl-[48px] pr-4 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    placeholder="officer@department.gov.in"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Password
                </label>
                <div className="relative w-full">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPass ? 'text' : 'password'}
                    className="w-full h-[52px] rounded-xl pl-[48px] pr-12 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 dark:text-white/70 cursor-pointer">
                  <input type="checkbox" className="rounded accent-blue-600 bg-white/80 dark:bg-white/10 border-slate-300 dark:border-white/30" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button with subtle blue glow */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.55)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/15" /></div>
              <div className="relative flex justify-center text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider font-semibold">
                <span className="bg-white/90 dark:bg-[#071d44]/90 px-3 rounded-full backdrop-blur-md border border-slate-200 dark:border-white/10">or continue with</span>
              </div>
            </div>

            {/* Google & DigiLocker */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogle}
                className="h-[46px] rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/30 text-slate-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => setDigiOpen(true)}
                className="h-[46px] rounded-xl bg-orange-500/10 dark:bg-orange-500/15 hover:bg-orange-500/20 dark:hover:bg-orange-500/25 border border-orange-400/30 dark:border-orange-400/40 text-orange-700 dark:text-orange-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                <Shield size={15} className="text-orange-500 dark:text-orange-400" />
                DigiLocker
              </button>
            </div>

            {/* Quick Demo Access Pills */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-slate-500 dark:text-white/50 font-mono font-normal">Test@123</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_DEMO.map(d => (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleDemoLogin(d)}
                    className="text-xs px-2.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-blue-50/60 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 hover:border-blue-400/50 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-all text-left font-medium cursor-pointer shadow-xs"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-white/60 mt-6">
              New business owner?{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </motion.div>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-center gap-5 mt-6 text-slate-500 dark:text-white/40 text-xs">
            <span>🔒 SSL Secured</span>
            <span>🏛️ Govt. of India</span>
            <span>✅ Act 2009 Compliant</span>
          </div>
        </div>
      </div>

      <DigiLockerModal open={digiOpen} onClose={() => setDigiOpen(false)} />
    </div>
  );
};

export default LoginPage;
