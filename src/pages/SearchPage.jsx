import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Award, Package, User } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageHeader, StatusBadge } from '@/components/shared';
import { MOCK_APPLICATIONS, MOCK_CERTIFICATES, MOCK_INSTRUMENTS } from '@/data/mockData';
import { formatDate } from '@/utils';

const searchAll = (query) => {
  const q = query.toLowerCase();
  const results = [];

  MOCK_APPLICATIONS.forEach(a => {
    if (
      a.applicationId?.toLowerCase().includes(q) ||
      a.serialNumber?.toLowerCase().includes(q) ||
      a.ownerName?.toLowerCase().includes(q) ||
      a.businessName?.toLowerCase().includes(q) ||
      a.instrumentType?.toLowerCase().includes(q)
    ) {
      results.push({ type: 'application', item: a });
    }
  });

  MOCK_CERTIFICATES.forEach(c => {
    if (
      c.certificateNumber?.toLowerCase().includes(q) ||
      c.serialNumber?.toLowerCase().includes(q) ||
      c.ownerName?.toLowerCase().includes(q) ||
      c.businessName?.toLowerCase().includes(q)
    ) {
      results.push({ type: 'certificate', item: c });
    }
  });

  MOCK_INSTRUMENTS.forEach(i => {
    if (
      i.serialNumber?.toLowerCase().includes(q) ||
      i.manufacturer?.toLowerCase().includes(q) ||
      i.modelNumber?.toLowerCase().includes(q) ||
      i.businessName?.toLowerCase().includes(q)
    ) {
      results.push({ type: 'instrument', item: i });
    }
  });

  return results;
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

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
    application: { icon: FileText, label: 'Application', color: 'bg-blue-100 text-blue-700' },
    certificate:  { icon: Award,    label: 'Certificate',  color: 'bg-green-100 text-green-700' },
    instrument:   { icon: Package,  label: 'Instrument',   color: 'bg-purple-100 text-purple-700' },
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Global Search"
        subtitle="Search across applications, certificates, instruments, and businesses"
        breadcrumbs={['Dashboard', 'Search']}
      />

      {/* Search Input */}
      <div className="max-w-2xl mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="form-input pl-12 pr-12 py-3.5 text-base shadow-sm"
            placeholder="Search by certificate no., application ID, serial no., owner name..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {['NS-CERT-2026', 'MT-2024-B123', 'Rajesh Kumar', 'Sharma Pharma'].map(hint => (
            <button
              key={hint}
              onClick={() => handleSearch(hint)}
              className="text-xs px-3 py-1 bg-blue-50 text-royal rounded-full hover:bg-blue-100 transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-sm text-slate mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>

            {results.length === 0 ? (
              <div className="card text-center py-12">
                <Search size={32} className="text-gray-300 mx-auto mb-3" />
                <div className="font-medium text-gray-600">No records found</div>
                <div className="text-sm text-slate mt-1">Try different keywords — certificate number, serial number, owner name</div>
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
                      transition={{ delay: i * 0.05 }}
                      className="card hover:border-royal hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${color}`}>{label}</span>
                            {type === 'application' && <StatusBadge status={item.status} />}
                            {type === 'certificate' && <span className="badge badge-certificate_generated">Active</span>}
                          </div>
                          <div className="font-semibold text-gray-900">
                            {type === 'application' && item.applicationId}
                            {type === 'certificate' && item.certificateNumber}
                            {type === 'instrument' && item.instrumentType}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {type === 'application' && `${item.instrumentType} — ${item.ownerName} — ${item.businessName}`}
                            {type === 'certificate' && `${item.instrumentType} — ${item.ownerName} — SN: ${item.serialNumber}`}
                            {type === 'instrument' && `${item.manufacturer} ${item.modelNumber} — SN: ${item.serialNumber}`}
                          </div>
                          <div className="text-xs text-slate mt-1">
                            {type === 'application' && `Submitted: ${formatDate(item.submittedAt)}`}
                            {type === 'certificate' && `Valid until: ${formatDate(item.validUntil)}`}
                            {type === 'instrument' && `${item.businessName} — ${item.district}`}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {type === 'certificate' && (
                            <a href={`/verify/${item.certificateNumber}`} target="_blank" rel="noreferrer"
                              className="btn btn-primary btn-sm text-xs">Verify</a>
                          )}
                          {type === 'application' && (
                            <Link to={`/owner/applications/${item.id}`} className="btn btn-outline btn-sm text-xs">View</Link>
                          )}
                          {type === 'instrument' && (
                            <Link to={`/owner/instruments/${item.id}`} className="btn btn-outline btn-sm text-xs">View</Link>
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
        <div className="text-center py-16 text-slate">
          <Search size={40} className="text-gray-200 mx-auto mb-3" />
          <div className="text-sm">Start typing to search across all records</div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SearchPage;
