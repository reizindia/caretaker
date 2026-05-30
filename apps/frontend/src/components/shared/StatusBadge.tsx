'use client';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
  PENDING:      { label: 'Pending',      dot: 'bg-amber-400',   className: 'bg-amber-50 text-amber-700 ring-amber-200/60' },
  CONFIRMED:    { label: 'Confirmed',    dot: 'bg-blue-400',    className: 'bg-blue-50 text-blue-700 ring-blue-200/60' },
  PROCESSING:   { label: 'Processing',   dot: 'bg-indigo-400',  className: 'bg-indigo-50 text-indigo-700 ring-indigo-200/60' },
  PREPARING:    { label: 'Preparing',    dot: 'bg-orange-400',  className: 'bg-orange-50 text-orange-700 ring-orange-200/60' },
  COMPLETED:    { label: 'Completed',    dot: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60' },
  CANCELLED:    { label: 'Cancelled',    dot: 'bg-rose-400',    className: 'bg-rose-50 text-rose-700 ring-rose-200/60' },
  APPROVED:     { label: 'Approved',     dot: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60' },
  REJECTED:     { label: 'Rejected',     dot: 'bg-rose-400',    className: 'bg-rose-50 text-rose-700 ring-rose-200/60' },
  ENTERED:      { label: 'Entered',      dot: 'bg-blue-400',    className: 'bg-blue-50 text-blue-700 ring-blue-200/60' },
  EXITED:       { label: 'Exited',       dot: 'bg-slate-400',   className: 'bg-slate-50 text-slate-600 ring-slate-200/60' },
  ACTIVE:       { label: 'Active',       dot: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60' },
  INACTIVE:     { label: 'Inactive',     dot: 'bg-rose-400',    className: 'bg-rose-50 text-rose-700 ring-rose-200/60' },
  IN_STOCK:     { label: 'In Stock',     dot: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60' },
  OUT_OF_STOCK: { label: 'Out of Stock', dot: 'bg-rose-400',    className: 'bg-rose-50 text-rose-700 ring-rose-200/60' },
  SOLD:         { label: 'Sold',         dot: 'bg-slate-400',   className: 'bg-slate-50 text-slate-600 ring-slate-200/60' },
  AVAILABLE:    { label: 'Available',    dot: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    dot: 'bg-slate-400',
    className: 'bg-slate-50 text-slate-600 ring-slate-200/60',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
