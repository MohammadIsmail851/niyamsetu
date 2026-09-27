import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Lock, Globe, Moon, Sun, Shield,
  Smartphone, Save, Check
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader } from '@/components/shared';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/store';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useAppStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [renewalReminders, setRenewalReminders] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="System Settings"
        subtitle="Manage display preferences, notification channels, and statutory alerts"
        breadcrumbs={['Dashboard', 'Settings']}
      />

      <div className="space-y-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Theme & Display Preferences */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              Display & Theme Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Active Theme Mode</div>
                  <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Currently set to <span className="font-bold capitalize text-blue-600 dark:text-blue-400">{theme} Mode</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Portal Language</div>
                  <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Select bilingual display options (English / Telugu)
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-[40px] px-3 rounded-xl bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="en">English (Official)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statutory Notifications & Alerts */}
          <div className="rounded-[28px] p-6 sm:p-8 bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-slate-200/80 dark:border-white/18 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center">
                <Bell size={16} />
              </div>
              Statutory Notifications & Reminders
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Certificate Expiry Warnings (30 Days)</div>
                  <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Receive statutory re-verification prompts prior to certificate expiration
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={renewalReminders}
                  onChange={(e) => setRenewalReminders(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Email Dispatch Alerts</div>
                  <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Inspection visit schedules, pass/fail notices, and issued certificates
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 cursor-pointer">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">SMS Gateway Notifications</div>
                  <div className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                    Critical verification time-slots and officer visit confirmations
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-[48px] px-8 rounded-xl font-semibold text-sm text-white flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(37,99,235,0.35)] dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
