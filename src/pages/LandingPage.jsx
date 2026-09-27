import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Cpu, QrCode, Globe, ArrowRight, CheckCircle,
  Package, FileText, Award, BarChart2, Phone, Scale,
} from 'lucide-react';

const features = [
  { icon: Package,    title: 'Instrument Registry',         desc: 'Register all weighing & measuring instruments with AI-assisted OCR data extraction.' },
  { icon: FileText,   title: 'Online Verification',         desc: 'Apply for verification online. Track every stage from submission to certificate.' },
  { icon: Shield,     title: 'Legal Compliance',            desc: 'Built for Legal Metrology Act, 2009 & Rules, 2011. Every workflow follows official procedures.' },
  { icon: QrCode,     title: 'QR Digital Certificates',     desc: 'Tamper-proof digital certificates with embedded QR codes for instant public verification.' },
  { icon: Cpu,        title: 'AI OCR Integration',          desc: 'Upload instrument photos — AI extracts manufacturer, model, serial & capacity automatically.' },
  { icon: Globe,      title: 'Multilingual (BHASHINI)',     desc: 'Full Telugu & English support. Switch languages instantly across the entire platform.' },
  { icon: BarChart2,  title: 'Analytics Dashboard',         desc: 'District-wise pendency, officer workload, and monthly trends for administrators.' },
  { icon: Phone,      title: 'Mobile Field Verification',   desc: 'Touch-optimized officer workflow with camera upload, GPS, and offline-ready forms.' },
];

const roles = [
  { role: 'Business Owner',        desc: 'Register instruments, apply for verification, download certificates', color: 'bg-blue-50 border-blue-200',   icon: '🏭', to: '/login' },
  { role: 'LM Officer',            desc: 'Schedule inspections, enter field observations, issue certificates',   color: 'bg-purple-50 border-purple-200', icon: '👮', to: '/login' },
  { role: 'GATC Laboratory',       desc: 'Receive assigned tests, record measurements, upload reports',           color: 'bg-amber-50 border-amber-200',  icon: '🔬', to: '/login' },
  { role: 'State Administrator',   desc: 'Monitor district pendency, manage officers, view analytics',           color: 'bg-green-50 border-green-200',  icon: '🏛️', to: '/login' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    {/* Navbar */}
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center">
            <span className="text-white font-bold text-sm">NS</span>
          </div>
          <div>
            <div className="font-bold text-navy text-base leading-tight">NIYAMSETU</div>
            <div className="text-[10px] text-slate leading-tight hidden sm:block">Legal Metrology Verification</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/verify/NS-CERT-2026-001045" className="text-sm text-slate hover:text-navy hidden sm:block">Verify Certificate</Link>
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="bg-gradient-to-br from-navy via-navy-800 to-royal text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
            <Scale size={14} />
            <span>Smart India Hackathon 2026 — PS 26036</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            NIYAMSETU
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light mb-2">
            Unified Digital Verification Platform
          </p>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            The complete online verification ecosystem for weighing and measuring instruments 
            under the Legal Metrology Act, 2009 & Rules, 2011
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="btn btn-lg bg-white text-navy hover:bg-gray-100 shadow-xl">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/verify/NS-CERT-2026-001045" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10">
              <QrCode size={16} /> Demo Certificate
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {[
            { value: '10,000+', label: 'Instruments Registered' },
            { value: '248',     label: 'Applications This Year' },
            { value: '189',     label: 'Active Certificates' },
            { value: '28',      label: 'Districts Covered' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl py-5 px-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Portal Access */}
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Four Dedicated Portals</h2>
          <p className="text-slate mt-2">Each stakeholder gets their own tailored experience</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(r => (
            <Link key={r.role} to={r.to} className={`block p-5 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${r.color}`}>
              <div className="text-3xl mb-3">{r.icon}</div>
              <div className="font-bold text-gray-900 mb-1">{r.role}</div>
              <div className="text-xs text-slate">{r.desc}</div>
              <div className="flex items-center gap-1 text-xs font-semibold text-royal mt-3">
                Access Portal <ArrowRight size={11} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Platform Features</h2>
          <p className="text-slate mt-2">Everything needed for end-to-end digital verification</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-gray-200 hover:border-royal hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <f.icon size={18} className="text-royal" />
              </div>
              <div className="font-semibold text-gray-900 mb-1">{f.title}</div>
              <div className="text-xs text-slate">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Workflow */}
    <section className="py-16 px-4 bg-navy text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-10">Verification Lifecycle</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['Registration', 'Instrument Registration', 'Application', 'Admin Assignment', 'LMO / GATC', 'Inspection', 'Pass/Fail', 'QR Certificate', 'Validity Tracking', 'Renewal'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-royal flex items-center justify-center text-xs font-bold">{i+1}</div>
                <div className="text-xs text-white/70 mt-1 text-center max-w-[70px]">{step}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-white/30 flex-shrink-0 mb-4" />}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Start?</h2>
        <p className="text-slate mb-6">Join NIYAMSETU for transparent, efficient legal metrology verification</p>
        <div className="flex gap-3 justify-center">
          <Link to="/register" className="btn btn-primary btn-lg">Register Business</Link>
          <Link to="/login"    className="btn btn-outline btn-lg">Sign In</Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-navy text-white py-8 px-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <span className="font-bold text-xs">NS</span>
        </div>
        <span className="font-bold">NIYAMSETU</span>
      </div>
      <p className="text-white/50 text-xs">
        Ministry of Consumer Affairs, Food and Public Distribution · Government of India
      </p>
      <p className="text-white/30 text-[10px] mt-2">
        Smart India Hackathon 2026 · PS 26036 · Legal Metrology Act, 2009
      </p>
    </footer>
  </div>
);

export default LandingPage;
