import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';
import { VALIDITY_PERIODS } from '@/types/enums';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—';
  try {
    if (date?.toDate) return format(date.toDate(), fmt);
    if (typeof date === 'string') return format(parseISO(date), fmt);
    return format(date, fmt);
  } catch {
    return '—';
  }
};

export const calculateExpiry = (verificationDate, instrumentType) => {
  const months = VALIDITY_PERIODS[instrumentType] || 12;
  const base = verificationDate?.toDate ? verificationDate.toDate() : new Date(verificationDate);
  return addMonths(base, months);
};

export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const d = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate);
  return differenceInDays(d, new Date());
};

export const getStatusColor = (status) => {
  const map = {
    draft: 'text-slate-600 bg-slate-100',
    submitted: 'text-blue-700 bg-blue-100',
    assigned: 'text-amber-800 bg-amber-100',
    scheduled: 'text-purple-800 bg-purple-100',
    inspection_completed: 'text-sky-800 bg-sky-100',
    verified: 'text-green-800 bg-green-100',
    certificate_generated: 'text-emerald-800 bg-emerald-100',
    expired: 'text-red-800 bg-red-100',
    rejected: 'text-red-800 bg-red-100',
  };
  return map[status] || 'text-gray-600 bg-gray-100';
};

export const generateAppId = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900000) + 100000);
  return `NS-APP-${year}-${num}`;
};

export const generateCertId = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900000) + 100000);
  return `NS-CERT-${year}-${num}`;
};

export const truncate = (str, n = 30) =>
  str?.length > n ? str.slice(0, n) + '…' : str;

export const maskAadhaar = (n) =>
  n ? 'XXXX XXXX ' + String(n).slice(-4) : 'XXXX XXXX XXXX';
