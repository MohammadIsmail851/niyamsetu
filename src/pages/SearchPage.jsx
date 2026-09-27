import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Award, Package } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, StatusBadge } from '@/components/shared';
import { getDocuments } from '@/firebase/firestore';
import { formatDate } from '@/utils';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [allData, setAllData] = useState({ applications: [], certificates: [], instruments: [] });
  const [loadingData, setLoadingData] = useState(true);

  // Pre-load all data once on mount for instant search
  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const [apps, certs, insts] = await Promise.all([
          getDocuments('applications'),
          getDocuments('certificates'),
          getDocuments('instruments'),
        ]);
        if (isMounted) {
          setAllData({
            applications: apps || [],
            certificates: certs || [],
            instruments: insts || [],
          });
        }
      } catch {
        // Silently fail — search will return empty
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, []);

  const searchAll = (q) => {
    const lq = q.toLowerCase();
    const hits = [];

    allData.applications.forEach(a => {
      if (
        (a.applicationId || '').toLowerCase().includes(lq) ||
        (a.serialNumber || '').toLowerCase().includes(lq) ||
        (a.ownerName || '').toLowerCase().includes(lq) ||
        (a.businessName || '').toLowerCase().includes(lq) ||
        (a.instrumentType || '').toLowerCase().includes(lq)
      ) hits.push({ type: 'application', item: a });
    });

    allData.certificates.forEach(c => {
      if (
        (c.certificateNumber || '').toLowerCase().includes(lq) ||
        (c.serialNumber || '').toLowerCase().includes(lq) ||
        (c.ownerName || '').toLowerCase().includes(lq) ||
        (c.businessName || '').toLowerCase().includes(lq)
      ) hits.push({ type: 'certificate', item: c });
    });

    allData.instruments.forEach(i => {
      if (
        (i.serialNumber || '').toLowerCase().includes(lq) ||
        (i.manufacturer || '').toLowerCase().includes(lq) ||
        (i.modelNumber || '').toLowerCase().includes(lq) ||
        (i.businessName || '').toLowerCase().includes(lq)
      ) hits.push({ type: 'instrument', item: i });
    });

    return hits;
  };

  const handleSearch = (q) => {
    setQuery(q);
    if (q.trim().length >= 2) {
      setResults(searchAll(q));
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  const typeConfig = {
    application: { icon: FileText, label: 'Application', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30' },
    certificate:  { icon: Award,    label: 'Certificate',  color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30' },
    instrument:   { icon: Package,  label: 'Instrument',   color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30' },
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Global Search"
        subtitle="Search across applications, certificates, and instruments"
        breadcrumbs={['Dashboard', 'Search']}
      />

      {/* Search Input with 52px height, 48px left padding, relative parent */}
      <div className="max-w-2xl mb-6">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-white/50" />
          <input
            className="w-full h-[52px] rounded-xl pl-[48px] pr-12 bg-white/80 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
            placeholder="Search by certificate no., application ID, serial no., owner name..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
            disabled={loadingData}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {loadingData && (
          <p className="text-xs text-slate-500 dark:text-white/40 mt-2 flex items-center gap-1.5">
            <span className="w-3 h-3 border border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin inline-block" />
            Loading records...
          </p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs text-slate-600 dark:text-white/60 mb-3 font-medium">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>

            {results.length === 0 ? (
              <div
                className="rounded-[28px] text-center py-12 px-6 bg-white/80 dark:bg-white/8 backdrop-blur-2xl border border-slate-200/80 dark:border-white/16 shadow-[0_12px_40px_rgba(0,30,100,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              >
                <Search size={32} className="text-slate-400 dark:text-white/30 mx-auto mb-3" />
                <div className="font-bold text-slate-900 dark:text-white text-base">No records found</div>
                <div className="text-xs text-slate-500 dark:text-white/50 mt-1 max-w-sm mx-auto">
                  Try searching with an alternative certificate number, serial number, or business name.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(({ type, item }, i) => {
                  const { icon: Icon, label, color } = typeConfig[type];
                  return (
                    <motion.div
                      key={`${type}-${item.id}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-[24px] p-5 transition-all duration-200 hover:scale-[1.01] bg-white/80 dark:bg-white/8 backdrop-blur-2xl border border-slate-200/80 dark:border-white/16 shadow-[0_8px_30px_rgba(0,30,100,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 shadow-xs">
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${color}`}>
                              {label}
                            </span>
                            {type === 'application' && <StatusBadge status={item.status} />}
                            {type === 'certificate' && <span className="badge badge-certificate_generated">Active</span>}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-base">
                            {type === 'application' && item.applicationId}
                            {type === 'certificate' && item.certificateNumber}
                            {type === 'instrument' && item.instrumentType}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-white/70 mt-0.5">
                            {type === 'application' && `${item.instrumentType} — ${item.ownerName} — ${item.businessName}`}
                            {type === 'certificate' && `${item.instrumentType} — ${item.ownerName} — SN: ${item.serialNumber}`}
                            {type === 'instrument' && `${item.manufacturer} ${item.modelNumber} — SN: ${item.serialNumber}`}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-white/40 mt-1">
                            {type === 'application' && `Submitted: ${formatDate(item.submittedAt)}`}
                            {type === 'certificate' && `Valid until: ${formatDate(item.validUntil)}`}
                            {type === 'instrument' && `${item.businessName} — ${item.district}`}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {type === 'certificate' && (
                            <Link
                              to={`/verify/${item.certificateNumber}`}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.35)] dark:shadow-[0_0_12px_rgba(37,99,235,0.4)] transition-all inline-block"
                            >
                              Verify
                            </Link>
                          )}
                          {type === 'application' && (
                            <Link
                              to={`/owner/applications/${item.id}`}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white text-xs font-semibold transition-all inline-block"
                            >
                              View
                            </Link>
                          )}
                          {type === 'instrument' && (
                            <Link
                              to={`/owner/instruments/${item.id}`}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white text-xs font-semibold transition-all inline-block"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!searched && (
        <div className="text-center py-20 text-slate-400 dark:text-white/40">
          <Search size={40} className="text-slate-300 dark:text-white/20 mx-auto mb-3" />
          <div className="text-sm font-medium text-slate-600 dark:text-white/60">
            {loadingData ? 'Loading data...' : 'Type to search across certificates, applications, and instruments'}
          </div>
          <div className="text-xs text-slate-400 dark:text-white/40 mt-1">Supports instant live query matching</div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SearchPage;
