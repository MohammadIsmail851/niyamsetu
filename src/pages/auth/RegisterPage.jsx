import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Building, ChevronRight, Shield } from 'lucide-react';
import { registerWithEmail } from '@/firebase/auth';
import { useAuthStore } from '@/store';
import { USER_ROLES } from '@/types/enums';

const ROLES = [
  { value: USER_ROLES.BUSINESS_OWNER, label: 'Business Owner', desc: 'Register & verify instruments', color: 'border-blue-400 bg-blue-50' },
  { value: USER_ROLES.LMO, label: 'Legal Metrology Officer', desc: 'Inspect & certify instruments', color: 'border-purple-400 bg-purple-50' },
  { value: USER_ROLES.GATC, label: 'GATC Laboratory', desc: 'Technical testing & reports', color: 'border-amber-400 bg-amber-50' },
  { value: USER_ROLES.ADMIN, label: 'State Administrator', desc: 'Manage officers & analytics', color: 'border-green-400 bg-green-50' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.BUSINESS_OWNER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

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
    } catch (e) {
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
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-800 to-royal flex flex-col">
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <span className="text-white font-bold text-sm">NS</span>
        </div>
        <div className="text-white font-bold text-base">NIYAMSETU</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-navy to-royal px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold">Create Account</div>
                  <div className="text-white/70 text-xs">NIYAMSETU — Legal Metrology Portal</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Role selector */}
              <div className="mb-5">
                <label className="form-label">Select Your Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${selectedRole === r.value ? r.color + ' border-opacity-100' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                      <div className="text-xs text-slate mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-sm text-red-700">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                      <input {...register('name', { required: 'Name is required' })} className="form-input pl-9" placeholder="Your full name" />
                    </div>
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                      <input {...register('email', { required: 'Email is required' })} className="form-input pl-9" placeholder="your@email.com" />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">Phone <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                      <input {...register('phone', { required: 'Phone is required' })} className="form-input pl-9" placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                      <input {...register('password', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} type="password" className="form-input pl-9" placeholder="••••••••" />
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ChevronRight size={16} />
                </button>
              </form>

              <p className="text-center text-sm text-slate mt-4">
                Already registered?{' '}
                <Link to="/login" className="text-royal font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
