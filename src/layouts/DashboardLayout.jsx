import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, FileText, Award, Bell, User,
  Settings, LogOut, ChevronLeft, ChevronRight, Globe, Menu, X, Shield,
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import { logout } from '@/firebase/auth';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/utils';
import FloatingBlobs from '@/components/FloatingBlobs';
import ThemeToggle from '@/components/ThemeToggle';

const roleNavItems = {
  business_owner: [
    { to: '/owner/dashboard',    icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/owner/instruments',  icon: Package,         labelKey: 'instruments' },
    { to: '/owner/applications', icon: FileText,        labelKey: 'applications' },
    { to: '/owner/certificates', icon: Award,           labelKey: 'certificates' },
    { to: '/profile',            icon: User,            labelKey: 'profile' },
  ],
  lmo: [
    { to: '/lmo/dashboard',      icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/lmo/applications',   icon: FileText,        labelKey: 'applications' },
    { to: '/lmo/inspections',    icon: Package,         labelKey: 'instruments' },
    { to: '/lmo/certificates',   icon: Award,           labelKey: 'certificates' },
    { to: '/profile',            icon: User,            labelKey: 'profile' },
  ],
  gatc: [
    { to: '/gatc/dashboard',     icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/gatc/tests',         icon: Package,         labelKey: 'instruments' },
    { to: '/gatc/reports',       icon: FileText,        labelKey: 'applications' },
    { to: '/profile',            icon: User,            labelKey: 'profile' },
  ],
  admin: [
    { to: '/admin/dashboard',    icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/admin/applications', icon: FileText,        labelKey: 'applications' },
    { to: '/admin/officers',     icon: User,            labelKey: 'profile' },
    { to: '/admin/analytics',    icon: Award,           labelKey: 'certificates' },
    { to: '/settings',           icon: Settings,        labelKey: 'settings' },
  ],
};

const roleBadge = {
  business_owner: { label: 'Business Owner', color: 'bg-blue-500/20 text-blue-300 border border-blue-400/30' },
  lmo:            { label: 'LM Officer',     color: 'bg-purple-500/20 text-purple-300 border border-purple-400/30' },
  gatc:           { label: 'GATC Lab',       color: 'bg-amber-500/20 text-amber-300 border border-amber-400/30' },
  admin:          { label: 'Administrator',  color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' },
};

export const DashboardLayout = ({ children }) => {
  const { profile, reset } = useAuthStore();
  const { sidebarOpen, toggleSidebar, language, setLanguage, notifications } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = notifications.filter(n => !n.read).length;
  const navItems = roleNavItems[profile?.role] || roleNavItems.business_owner;
  const badge = roleBadge[profile?.role] || roleBadge.business_owner;

  const handleLogout = async () => {
    await logout();
    reset();
    navigate('/login');
  };

  const SidebarContent = ({ compact }) => (
    <div className="flex flex-col h-full">
      {/* Brand Logo */}
      <div className="px-5 py-5 border-b border-slate-200/80 dark:border-white/10">
        <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-600/30 border border-blue-500/30 dark:border-blue-400/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(37,99,235,0.2)] dark:shadow-[0_0_16px_rgba(37,99,235,0.35)]">
            <Shield size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          {!compact && (
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-base tracking-wide leading-tight">NIYAMSETU</div>
              <div className="text-blue-600 dark:text-blue-200/60 text-[10px] tracking-wider uppercase leading-tight font-semibold">Legal Metrology</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'sidebar-link',
                isActive && 'active',
                compact && 'justify-center px-2'
              )
            }
            title={compact ? t(labelKey) : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!compact && <span className="font-medium text-sm">{t(labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Controls */}
      <div className="px-3 pb-5 border-t border-slate-200/80 dark:border-white/10 pt-3 space-y-1.5">
        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
          className={cn('sidebar-link w-full text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white', compact && 'justify-center px-2')}
        >
          <Globe size={16} className="flex-shrink-0 text-blue-600 dark:text-blue-400" />
          {!compact && <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>}
        </button>

        {/* User Card */}
        {!compact && (
          <div className="px-3.5 py-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 mt-2 backdrop-blur-md">
            <div className="text-slate-900 dark:text-white font-semibold text-sm truncate">{profile?.name || 'Authorized User'}</div>
            <div className="mt-1">
              <span className={cn('text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full', badge.color)}>
                {badge.label}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn('sidebar-link w-full text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-500/10', compact && 'justify-center px-2')}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!compact && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/50 to-slate-200 dark:from-[#04142F] dark:via-[#061c42] dark:to-[#0B2E6D] text-slate-800 dark:text-white relative">
      {/* Floating blurred light blobs */}
      <FloatingBlobs />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-white/80 dark:bg-[#04142F]/75 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 flex-shrink-0 overflow-hidden relative z-20"
      >
        <SidebarContent compact={!sidebarOpen} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 dark:bg-[#04142F]/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white/95 dark:bg-[#04142F]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-white/15 z-50 md:hidden"
            >
              <SidebarContent compact={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="h-16 bg-white/80 dark:bg-white/5 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Desktop collapse trigger */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            <div className="hidden sm:block text-xs font-semibold tracking-wider uppercase text-blue-700/80 dark:text-blue-200/60 pl-2">
              National Legal Metrology Digital Portal
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => navigate(profile?.role === 'admin' ? '/admin/notifications' : `/${profile?.role?.split('_')[0]}/notifications`)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Global Theme Toggle */}
            <ThemeToggle />

            {/* User Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">{profile?.name || 'User'}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-300/70 capitalize font-medium">{profile?.role?.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
