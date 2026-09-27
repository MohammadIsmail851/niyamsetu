import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '@/firebase/auth';
import { fetchUserProfile } from '@/firebase/auth';
import { useAuthStore } from '@/store';
import DigiLockerModal from './DigiLockerModal';

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
      // Demo mode: check configured test accounts
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
      setError('Google sign-in unavailable in demo mode.');
    }
  };

  const handleDemoLogin = (demo) => {
    setValue('email', demo.email);
    setValue('password', 'Test@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-800 to-royal flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <span className="text-white font-bold text-sm">NS</span>
        </div>
        <div>
          <div className="text-white font-bold text-base">NIYAMSETU</div>
          <div className="text-white/50 text-[10px]">Legal Metrology Verification</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top bar */}
            <div className="bg-gradient-to-r from-navy to-royal px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Secure Login</div>
                  <div className="text-white/70 text-xs">Government Digital Portal</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input
                      {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      className="form-input pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input
                      {...register('password', { required: 'Password is required' })}
                      type={showPass ? 'text' : 'password'}
                      className="form-input pl-9 pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-gray-700">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="text-royal hover:underline">Forgot Password?</Link>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs text-slate bg-white px-3">or continue with</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleGoogle} className="btn btn-outline text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button onClick={() => setDigiOpen(true)} className="btn btn-outline text-sm border-orange-400 text-orange-600 hover:bg-orange-50">
                  <img src="https://www.digilocker.gov.in/assets/img/digilocker_logo.png" alt="" className="h-4" onError={e => e.target.style.display='none'} />
                  DigiLocker
                </button>
              </div>

              {/* Demo accounts */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                  <span>🎯</span> Quick Demo Access
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {ROLE_DEMO.map(d => (
                    <button
                      key={d.role}
                      onClick={() => handleDemoLogin(d)}
                      className="text-xs px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-blue-600 mt-2 text-center">Demo Password: <span className="font-mono font-semibold">Test@123</span></div>
              </div>

              <p className="text-center text-sm text-slate mt-4">
                New business?{' '}
                <Link to="/register" className="text-royal font-semibold hover:underline">Register here</Link>
              </p>
            </div>
          </motion.div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 text-white/50 text-xs">
            <span>🔒 SSL Secured</span>
            <span>🏛️ Govt. of India</span>
            <span>✅ Legal Metrology Act 2009</span>
          </div>
        </div>
      </div>

      <DigiLockerModal open={digiOpen} onClose={() => setDigiOpen(false)} />
    </div>
  );
};

export default LoginPage;
