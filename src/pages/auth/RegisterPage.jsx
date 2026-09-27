import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Shield, ArrowRight, Check } from 'lucide-react';
import { registerWithEmail } from '@/firebase/auth';
import { useAuthStore } from '@/store';
import { USER_ROLES } from '@/types/enums';
import FloatingBlobs from '@/components/FloatingBlobs';
import ThemeToggle from '@/components/ThemeToggle';

const ROLES = [
  { value: USER_ROLES.BUSINESS_OWNER, label: 'Business Owner', desc: 'Register & verify instruments' },
  { value: USER_ROLES.LMO,            label: 'Legal Metrology Officer', desc: 'Inspect & certify instruments' },
  { value: USER_ROLES.GATC,           label: 'GATC Laboratory', desc: 'Technical testing & reports' },
  { value: USER_ROLES.ADMIN,          label: 'State Administrator', desc: 'Manage officers & analytics' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.BUSINESS_OWNER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await registerWithEmail(data.email, data.password, {
        role: selectedRole, name: data.name, phone: data.phone,
      });
      const profile = { uid: user.uid, email: data.email, role: selectedRole, name: data.name, phone: data.phone };
      setUser(user);
      setProfile(profile);
      const roleHome = { business_owner: '/owner/dashboard', lmo: '/lmo/dashboard', gatc: '/gatc/dashboard', admin: '/admin/dashboard' };
      navigate(roleHome[selectedRole]);
    } catch {
      // Demo mode fallback
      const mockUid = `demo-${Date.now()}`;
      const profile = { uid: mockUid, email: data.email, role: selectedRole, name: data.name, phone: data.phone };
      setUser({ uid: mockUid, email: data.email });
      setProfile(profile);
      const roleHome = { business_owner: '/owner/dashboard', lmo: '/lmo/dashboard', gatc: '/gatc/dashboard', admin: '/admin/dashboard' };
      navigate(roleHome[selectedRole]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/60 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] text-slate-800 dark:text-white flex flex-col relative overflow-x-hidden transition-colors duration-300">
      {/* Floating blurred light blobs */}
      <FloatingBlobs />

      {/* Top Navbar */}
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
            to="/login"
            className="text-xs text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md transition-all font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full rounded-[28px] p-6 sm:p-9 bg-white/75 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            {/* Header: Shield Icon, NIYAMSETU, Legal Metrology Verification Platform */}
            <div className="text-center mb-8">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/15 to-blue-400/10 dark:from-blue-600/40 dark:to-blue-400/20 border border-blue-500/25 dark:border-blue-400/30 items-center justify-center mb-3 shadow-[0_0_24px_rgba(37,99,235,0.2)] dark:shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                <Shield size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                NIYAMSETU
              </h1>
              <p className="text-sm sm:text-base text-blue-600 dark:text-blue-200/80 font-medium mt-1">
                Legal Metrology Verification Platform
              </p>
              <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
                Government of India · Standards of Weights and Measures
              </p>
            </div>

            {/* Role Selector: Animated Glass Pills */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-white/70 mb-2.5">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLES.map(r => {
                  const isSelected = selectedRole === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`relative px-4 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/10 dark:bg-blue-600/35 border-2 border-blue-600 dark:border-blue-400/60 shadow-[0_4px_16px_rgba(37,99,235,0.2)] dark:shadow-[0_0_20px_rgba(37,99,235,0.35)] scale-[1.02]'
                          : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700 dark:text-white' : 'text-slate-800 dark:text-white/80'}`}>
                          {r.label}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-xs">
                            <Check size={12} className="text-white stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/50 mt-0.5 leading-snug">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/40 rounded-xl mb-5 text-sm text-red-700 dark:text-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                    Full Name <span className="text-blue-600 dark:text-blue-400">*</span>
                  </label>
                  <div className="relative w-full">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
                    <input
                      {...register('name', { required: 'Full name is required' })}
                      className="w-full h-[52px] rounded-xl pl-[48px] pr-4 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                      placeholder="e.g. Ramesh Chandra Sharma"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>}
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                    Email Address <span className="text-blue-600 dark:text-blue-400">*</span>
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
                      placeholder="name@organization.gov.in"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                    Phone <span className="text-blue-600 dark:text-blue-400">*</span>
                  </label>
                  <div className="relative w-full">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      className="w-full h-[52px] rounded-xl pl-[48px] pr-4 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                    Password <span className="text-blue-600 dark:text-blue-400">*</span>
                  </label>
                  <div className="relative w-full">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Minimum 6 characters' }
                      })}
                      type="password"
                      className="w-full h-[52px] rounded-xl pl-[48px] pr-4 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {/* Create Account Button with subtle blue glow */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.55)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-slate-600 dark:text-white/60 mt-6">
              Already registered?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors">
                Sign In
              </Link>
            </p>

            {/* Legal Metrology Trust Footnote */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-white/40">
              <span>🏛️ Govt. of India</span>
              <span>•</span>
              <span>Legal Metrology Act, 2009</span>
              <span>•</span>
              <span>256-bit SSL</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
