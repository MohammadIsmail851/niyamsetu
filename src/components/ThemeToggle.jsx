import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-9 w-[68px] rounded-full p-1 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 select-none ${
        isDark
          ? 'bg-slate-800/80 border border-white/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
          : 'bg-white/80 border border-blue-200/70 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs pointer-events-none">
        <Sun size={14} className={`transition-opacity duration-300 ${isDark ? 'text-amber-400/40' : 'text-amber-500 opacity-90'}`} />
        <Moon size={14} className={`transition-opacity duration-300 ${isDark ? 'text-blue-400 opacity-90' : 'text-slate-400/40'}`} />
      </div>

      {/* Sliding Thumb (300ms transition) */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.3 }}
        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transform transition-colors duration-300 z-10 ${
          isDark
            ? 'translate-x-[32px] bg-gradient-to-tr from-blue-600 to-indigo-500 text-white'
            : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-amber-500 text-white'
        }`}
      >
        {isDark ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-white" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
