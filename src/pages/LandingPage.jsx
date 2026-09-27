import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, QrCode, ArrowRight, Package, ClipboardCheck, Clock,
  Scale, Building2, ShieldCheck, FlaskConical, BarChart3
} from 'lucide-react';
import FloatingBlobs from '@/components/FloatingBlobs';
import ThemeToggle from '@/components/ThemeToggle';

// 4 Core System Capabilities (replacing the old cards)
const systemCapabilities = [
  {
    title: 'Instrument Registration',
    desc: 'Register and manage weighing & measuring instruments with AI-assisted OCR nameplate detection.',
    icon: Scale,
  },
  {
    title: 'Verification Workflow',
    desc: 'Apply, schedule, inspect and track verification digitally with transparent audit trails.',
    icon: ClipboardCheck,
  },
  {
    title: 'QR Digital Certificate',
    desc: 'Generate and verify tamper-proof certificates instantly with embedded cryptographic signatures.',
    icon: QrCode,
  },
  {
    title: 'Validity & Renewal',
    desc: 'Automatic expiry tracking and renewal reminders under the Legal Metrology Act, 2009.',
    icon: Clock,
  },
];

// 4 Stakeholder Roles in 2x2 Glass Grid
const roles = [
  {
    role: 'Business Owner',
    desc: 'Register & Track Instruments',
    sub: 'Submit verification applications, manage instruments, and access digital certificates instantly.',
    icon: Building2,
    to: '/login',
  },
  {
    role: 'Legal Metrology Officer',
    desc: 'Inspect & Verify Instruments',
    sub: 'Schedule on-site inspections, record tolerance observations, and issue verified certificates.',
    icon: ShieldCheck,
    to: '/login',
  },
  {
    role: 'GATC Laboratory',
    desc: 'Technical Testing & Reports',
    sub: 'Receive assigned precision instruments, execute lab calibration, and upload statutory test records.',
    icon: FlaskConical,
    to: '/login',
  },
  {
    role: 'State Administrator',
    desc: 'Analytics & Officer Management',
    sub: 'Real-time state overview, district workload management, and compliance enforcement.',
    icon: BarChart3,
    to: '/login',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen theme-bg text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300">
      {/* Floating Ambient Light Blobs */}
      <FloatingBlobs />

      {/* Navbar with Global Theme Toggle in top-right */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-[#04142F]/75 backdrop-blur-xl border-b border-blue-200/50 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-600/25 border border-blue-500/25 dark:border-blue-400/40 flex items-center justify-center shadow-sm">
              <Shield size={22} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wide leading-tight text-slate-900 dark:text-white">
                NIYAMSETU
              </div>
              <div className="text-[10px] text-slate-500 dark:text-blue-200/60 leading-tight hidden sm:block uppercase tracking-wider font-medium">
                Legal Metrology Verification Platform
              </div>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/verify/NS-CERT-2026-001045"
              className="text-xs font-medium text-slate-600 dark:text-white/70 hover:text-blue-600 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors hidden sm:block"
            >
              Verify Certificate
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-white/90 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-blue-200/60 dark:border-white/15 backdrop-blur-md shadow-sm transition-all hover:scale-[1.02]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_18px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.7)] transition-all hover:scale-[1.02]"
            >
              Register
            </Link>

            {/* Global Theme Toggle */}
            <ThemeToggle className="ml-1" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Government Authority Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 dark:bg-white/10 border border-blue-500/20 dark:border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6 shadow-sm backdrop-blur-md">
              <Scale size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-slate-800 dark:text-white/90">
                Government of India · Legal Metrology Act, 2009
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-slate-950 dark:text-white">
              NIYAMSETU
            </h1>
            <p className="text-xl sm:text-2xl text-blue-600 dark:text-blue-300/90 font-light mb-4">
              Unified Digital Verification Platform
            </p>
            <p className="text-slate-600 dark:text-slate-300/80 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
              The national digital infrastructure for weighing and measuring instruments. 
              Facilitating transparent verification, inspection scheduling, tamper-proof QR certification, 
              and automated statutory validity tracking.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="h-[52px] px-8 rounded-xl font-semibold text-white flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.35)] dark:shadow-[0_0_28px_rgba(37,99,235,0.65)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/verify/NS-CERT-2026-001045"
                className="h-[52px] px-6 rounded-xl font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-blue-200/70 dark:border-white/20 backdrop-blur-md shadow-sm hover:scale-[1.02] active:scale-[0.99] transition-all"
              >
                <QrCode size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Verify Demo Certificate</span>
              </Link>
            </div>
          </motion.div>

          {/* Actual System Capabilities Grid (Replacing old feature cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
            {systemCapabilities.map((item) => (
              <div
                key={item.title}
                className="glass-card glass-card-hover p-6 rounded-[24px] flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
                    <item.icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access (2x2 Glass Grid) */}
      <section className="py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
              Role-Based Access
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-md mx-auto">
              Secure workspaces for every Legal Metrology stakeholder.
            </p>
          </div>

          {/* Responsive 2x2 Grid with Equal Card Heights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roles.map((r) => (
              <Link
                key={r.role}
                to={r.to}
                className="glass-card glass-card-hover p-7 rounded-[24px] h-full flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 dark:bg-blue-500/25 border border-blue-500/20 dark:border-blue-400/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-105 transition-transform">
                      <r.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug">
                        {r.role}
                      </h3>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {r.desc}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed pl-0.5">
                    {r.sub}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mt-5 group-hover:translate-x-1 transition-transform">
                  <span>Access Portal</span>
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Lifecycle Section */}
      <section className="py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 sm:p-12 text-center rounded-[24px]">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Official Verification Lifecycle
            </h2>
            <p className="text-slate-600 dark:text-slate-300/80 text-xs sm:text-sm mb-10 max-w-xl mx-auto">
              Statutory verification procedure governed by the Legal Metrology (General) Rules, 2011
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                'Business Register',
                'Instrument Entry',
                'Application Submission',
                'Officer Assignment',
                'Technical Verification',
                'Inspection Pass',
                'QR Certificate Issue',
                'Validity & Renewal',
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-blue-600/15 dark:bg-blue-600/35 border border-blue-500/30 dark:border-blue-400/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1.5 text-center max-w-[85px] leading-tight">
                      {step}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight size={14} className="text-slate-400 dark:text-white/30 flex-shrink-0 mb-5 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Verify CTA */}
      <section className="py-14 px-4 sm:px-6 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="glass-card p-8 sm:p-10 rounded-[24px]">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              Ready to Verify?
            </h2>
            <p className="text-slate-600 dark:text-slate-300/80 text-xs sm:text-sm mb-6">
              Access the official legal metrology verification network or register your business instruments today.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/register"
                className="h-[52px] px-8 rounded-xl font-semibold text-white flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-[0_4px_20px_rgba(37,99,235,0.35)] dark:shadow-[0_0_24px_rgba(37,99,235,0.7)] hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
              >
                Register Business
              </Link>
              <Link
                to="/login"
                className="h-[52px] px-6 rounded-xl font-semibold text-slate-800 dark:text-white/90 flex items-center gap-2 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-blue-200/70 dark:border-white/20 backdrop-blur-md shadow-sm hover:scale-[1.02] active:scale-[0.99] transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 border-t border-blue-200/50 dark:border-white/10 text-center transition-colors duration-300">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-white/10 border border-blue-500/20 dark:border-white/20 flex items-center justify-center">
            <Shield size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-wide">
            NIYAMSETU
          </span>
        </div>
        <p className="text-slate-600 dark:text-white/60 text-xs">
          Ministry of Consumer Affairs, Food and Public Distribution · Government of India
        </p>
        <p className="text-slate-400 dark:text-white/40 text-[11px] mt-1.5">
          Standards of Weights and Measures · Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
