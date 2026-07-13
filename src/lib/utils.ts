import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  if (!status) return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
  const s = status.toLowerCase();
  switch (s) {
    case 'active':
    case 'approved':
    case 'filed':
    case 'current':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    case 'pending':
    case 'draft':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    case 'inactive':
    case 'resigned':
    case 'cancelled':
    case 'changed':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400';
    case 'overdue':
    case 'disqualified':
    case 'struck off':
      return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
    case 'transferred':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400';
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}