import { cn } from '@/utils';

// ── Stat Card ─────────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, label, value, color = 'blue', trend, className }) => {
  const colors = {
    blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-100 text-blue-600',    text: 'text-blue-600' },
    green:   { bg: 'bg-green-50',   icon: 'bg-green-100 text-green-600',  text: 'text-green-600' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',  text: 'text-amber-600' },
    red:     { bg: 'bg-red-50',     icon: 'bg-red-100 text-red-600',      text: 'text-red-600' },
    purple:  { bg: 'bg-purple-50',  icon: 'bg-purple-100 text-purple-600',text: 'text-purple-600' },
    navy:    { bg: 'bg-blue-950/10',icon: 'bg-navy/10 text-navy',         text: 'text-navy' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.icon)}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-slate">{label}</div>
      </div>
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => (
  <span className={cn('badge', `badge-${status}`)}>
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
  </span>
);

// ── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => (
  <div className="mb-6">
    {breadcrumbs && (
      <div className="flex items-center gap-2 text-xs text-slate mb-2">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'text-gray-700 font-medium' : 'hover:text-royal cursor-pointer'}>
              {b}
            </span>
          </span>
        ))}
      </div>
    )}
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-400" />
    </div>
    <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
    <p className="text-sm text-slate max-w-xs">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ── Loading Spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={cn('rounded-full border-2 border-royal border-t-transparent animate-spin', sizes[size], className)} />
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

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
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn('relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden', sizes[size])}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{title}</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Form Field ────────────────────────────────────────────────────────────────
export const FormField = ({ label, error, required, children, className }) => (
  <div className={cn('', className)}>
    {label && (
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    {children}
    {error && <p className="form-error">{error}</p>}
  </div>
);

// ── Data Table ────────────────────────────────────────────────────────────────
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
            <tr><td colSpan={columns.length} className="text-center py-10 text-slate">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
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
