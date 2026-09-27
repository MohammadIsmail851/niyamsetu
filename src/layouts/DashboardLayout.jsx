import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, FileText, Award, Bell, User,
  Settings, LogOut, ChevronLeft, ChevronRight, Globe, Menu, X,
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/store';
import { logout } from '@/firebase/auth';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/utils';

const roleNavItems = {
  business_owner: [
    { to: '/owner/dashboard',    icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/owner/instruments',  icon: Package,         labelKey: 'instruments' },
    { to: '/owner/applications', icon: FileText,        labelKey: 'applications' },
    { to: '/owner/certificates', icon: Award,           labelKey: 'certificates' },
    { to: '/owner/profile',      icon: User,            labelKey: 'profile' },
  ],
  lmo: [
    { to: '/lmo/dashboard',      icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/lmo/applications',   icon: FileText,        labelKey: 'applications' },
    { to: '/lmo/inspections',    icon: Package,         labelKey: 'instruments' },
    { to: '/lmo/certificates',   icon: Award,           labelKey: 'certificates' },
    { to: '/lmo/profile',        icon: User,            labelKey: 'profile' },
  ],
  gatc: [
    { to: '/gatc/dashboard',     icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/gatc/tests',         icon: Package,         labelKey: 'instruments' },
    { to: '/gatc/reports',       icon: FileText,        labelKey: 'applications' },
    { to: '/gatc/profile',       icon: User,            labelKey: 'profile' },
  ],
  admin: [
    { to: '/admin/dashboard',    icon: LayoutDashboard, labelKey: 'dashboard' },
    { to: '/admin/applications', icon: FileText,        labelKey: 'applications' },
    { to: '/admin/officers',     icon: User,            labelKey: 'profile' },
    { to: '/admin/analytics',    icon: Award,           labelKey: 'certificates' },
    { to: '/admin/settings',     icon: Settings,        labelKey: 'settings' },
  ],
};

const roleBadge = {
  business_owner: { label: 'Business Owner', color: 'bg-blue-100 text-blue-700' },
  lmo: { label: 'LM Officer', color: 'bg-purple-100 text-purple-700' },
  gatc: { label: 'GATC Lab', color: 'bg-amber-100 text-amber-800' },
  admin: { label: 'Administrator', color: 'bg-emerald-100 text-emerald-700' },
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
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
          <div className="w-9 h-9 rounded-lg bg-royal flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">NS</span>
          </div>
          {!compact && (
            <div>
              <div className="text-white font-bold text-base leading-tight">NIYAMSETU</div>
              <div className="text-white/50 text-[10px] leading-tight">Legal Metrology</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active', compact && 'justify-center px-2')
            }
            title={compact ? t(labelKey) : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!compact && <span>{t(labelKey)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
          className={cn('sidebar-link w-full', compact && 'justify-center px-2')}
        >
          <Globe size={16} className="flex-shrink-0" />
          {!compact && <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>}
        </button>

        {/* User info */}
        {!compact && (
          <div className="px-3 py-2 rounded-lg bg-white/5 mt-2">
            <div className="text-white/90 text-sm font-semibold truncate">{profile?.name || 'User'}</div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badge.color)}>
              {badge.label}
            </span>
          </div>
        )}

        <button onClick={handleLogout} className={cn('sidebar-link w-full', compact && 'justify-center px-2')}>
          <LogOut size={16} className="flex-shrink-0" />
          {!compact && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 64 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-navy flex-shrink-0 overflow-hidden"
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-navy z-50 md:hidden"
            >
              <SidebarContent compact={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(true)} className="md:hidden btn-ghost p-1.5 rounded-lg">
              <Menu size={20} />
            </button>
            {/* Desktop toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-slate transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => navigate(profile?.role === 'admin' ? '/admin/notifications' : `/${profile?.role?.split('_')[0]}/notifications`)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate transition-colors"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-royal flex items-center justify-center text-white text-sm font-semibold">
              {profile?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
