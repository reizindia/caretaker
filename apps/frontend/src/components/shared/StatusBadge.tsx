'use client';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800' },
  PREPARING: { label: 'Preparing', className: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
  ENTERED: { label: 'Entered', className: 'bg-blue-100 text-blue-800' },
  EXITED: { label: 'Exited', className: 'bg-gray-100 text-gray-800' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
  INACTIVE: { label: 'Inactive', className: 'bg-red-100 text-red-800' },
  IN_STOCK: { label: 'In Stock', className: 'bg-green-100 text-green-800' },
  OUT_OF_STOCK: { label: 'Out of Stock', className: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
