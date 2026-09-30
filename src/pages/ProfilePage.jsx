import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building, ShieldCheck, MapPin,
  CheckCircle2, Shield, Save, Edit3, Calendar, FileText
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared';
import { useAuthStore } from '@/store';
import { db } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { profile, user, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    businessName: profile?.businessName || '',
    gstNumber: profile?.gstNumber || '',
    address: profile?.address || '',
    district: profile?.district || '',
    state: profile?.state || 'Telangana',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const uid = profile?.uid;
    if (!uid) { toast.error('Session expired. Please log in.'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      console.error('[ProfilePage] save error:', err);
      toast.error(`Save failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const roleLabels = {
    business_owner: 'Registered Business Owner',
    lmo: 'Legal Metrology Officer (Inspector)',
    gatc: 'GATC Technical Laboratory Staff',
    admin: 'State Metrology Administrator',
  };

  const roleBadges = {
    business_owner: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30',
    lmo: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30',
    gatc: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
    admin: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Account Profile"
        subtitle="Manage your identity credentials, authorized legal metrology permissions, and contact records"
        breadcrumbs={['Dashboard', 'Profile']}
        actions={
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="h-[44px] px-5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] dark:shadow-[0_0_18px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
          >
            <Edit3 size={15} />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        }
      />

      <div className="space-y-6 max-w-4xl">
        {/* Profile Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {profile?.name || 'Authorized User'}
                  </h2>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleBadges[profile?.role] || roleBadges.business_owner}`}>
                    {roleLabels[profile?.role] || 'Business Owner'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-blue-200/70 mt-1 flex items-center gap-2 flex-wrap">
                  <span>ID: <span className="font-mono font-medium text-slate-700 dark:text-white/80">{profile?.uid || user?.uid || 'NS-USER-001'}</span></span>
                  <span>•</span>
                  <span>National Legal Metrology Digital Portal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {profile?.digilockerVerified ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 size={15} />
                  <span>DigiLocker Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-400/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <ShieldCheck size={15} />
                  <span>Statutory User</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Information Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal & Contact Credentials */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center">
                <User size={16} />
              </div>
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    value={profile?.email || user?.email || 'user@niyamsetu.gov.in'}
                    disabled
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 cursor-not-allowed outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Account Role
                </label>
                <div className="relative">
                  <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    value={roleLabels[profile?.role] || 'Business Owner'}
                    disabled
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 cursor-not-allowed outline-none text-sm capitalize"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Business / Department Profile */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center">
                <Building size={16} />
              </div>
              Statutory Business & Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Enterprise / Organization Name
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                    placeholder="Enterprise Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  GSTIN / Tax Identification
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm font-mono transition-all focus:border-blue-500"
                    placeholder="36AADCS5678N1Z2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Jurisdiction District
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                    placeholder="District"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  State
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 pointer-events-none" />
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full h-[50px] rounded-xl pl-[44px] pr-4 bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/80 mb-1.5">
                  Official Business Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed outline-none text-sm transition-all focus:border-blue-500"
                  placeholder="Installation address of weighing & measuring equipment"
                />
              </div>
            </div>
          </div>

          {/* Security & Statutory Compliance */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/30 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              Statutory Compliance & Security Standards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="text-slate-500 dark:text-white/50 mb-1">Governing Legislation</div>
                <div className="font-semibold text-slate-900 dark:text-white">Legal Metrology Act, 2009</div>
                <div className="text-[11px] text-slate-400 dark:text-white/40 mt-1">General Rules, 2011</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="text-slate-500 dark:text-white/50 mb-1">Data Protection</div>
                <div className="font-semibold text-slate-900 dark:text-white">256-bit Cryptographic Vault</div>
                <div className="text-[11px] text-slate-400 dark:text-white/40 mt-1">End-to-End SSL Verified</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div className="text-slate-500 dark:text-white/50 mb-1">Authorization Status</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Active & Good Standing
                </div>
                <div className="text-[11px] text-slate-400 dark:text-white/40 mt-1">Audit Trail Enabled</div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-[48px] px-6 rounded-xl font-semibold text-sm text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-[48px] px-7 rounded-xl font-semibold text-sm text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
