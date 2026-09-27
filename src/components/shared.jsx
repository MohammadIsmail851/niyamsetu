import { cn } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FolderOpen } from 'lucide-react';

// ── Stat Card with Glassmorphism ─────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, color = 'blue', trend, className }) => {
  const colors = {
    blue:    { iconBg: 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/30' },
    green:   { iconBg: 'bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-400/30' },
    amber:   { iconBg: 'bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-400/30' },
    red:     { iconBg: 'bg-rose-600/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-400/30' },
    purple:  { iconBg: 'bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 dark:border-purple-400/30' },
    navy:    { iconBg: 'bg-blue-800/10 dark:bg-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-600/20 dark:border-blue-400/30' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div
      className={cn(
        'stat-card',
        className
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs', c.iconBg)}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md',
              trend >= 0
                ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-400/30 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-400/30 text-rose-600 dark:text-rose-300'
            )}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</div>
        <div className="text-xs sm:text-sm text-slate-500 dark:text-white/60 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => (
  <span className={cn('badge', `badge-${status}`)}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
    <span className="capitalize">{status?.replace(/_/g, ' ')}</span>
  </span>
);

// ── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => (
  <div className="mb-6">
    {breadcrumbs && (
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50 mb-2">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300 dark:text-white/20">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-white/90 font-medium' : 'hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer'}>
              {b}
            </span>
          </span>
        ))}
      </div>
    )}
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 dark:text-blue-200/70 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  </div>
);

// ── Elegant Empty State ───────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon = FolderOpen, title, description, action }) => (
  <div
    className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[28px] bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/12 backdrop-blur-xl shadow-xs"
  >
    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center mb-4 shadow-[0_4px_16px_rgba(37,99,235,0.15)] dark:shadow-[0_0_24px_rgba(37,99,235,0.25)]">
      <Icon size={34} className="text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-white/60 max-w-sm leading-relaxed">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={cn('rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin', sizes[size], className)} />
  );
};

// ── Glass Modal ───────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 dark:bg-[#04142F]/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn('relative w-full overflow-hidden text-slate-900 dark:text-white bg-white/95 dark:bg-[#081a3c]/95 border border-slate-200 dark:border-white/22 rounded-[28px] shadow-2xl backdrop-blur-2xl', sizes[size])}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="font-bold text-slate-900 dark:text-white text-base tracking-wide">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[80vh] p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Form Field ────────────────────────────────────────────────────────────────
export const FormField = ({ label, error, required, children, className }) => (
  <div className={cn('w-full', className)}>
    {label && (
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-white/75 mb-2">
        {label} {required && <span className="text-blue-600 dark:text-blue-400">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
  </div>
);

// ── Glass Data Table ──────────────────────────────────────────────────────────
export const DataTable = ({ columns, data, emptyMessage = 'No records found', loading }) => {
  if (loading) return (
    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-500 dark:text-white/50">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FolderOpen size={24} className="text-blue-600/40 dark:text-blue-400/50" />
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors">
                {columns.map(c => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
