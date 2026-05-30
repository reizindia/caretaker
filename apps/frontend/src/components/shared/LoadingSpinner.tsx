'use client';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-[3px]',
  };
  return (
    <div className={`flex items-center justify-center ${size === 'lg' ? 'min-h-[50vh]' : 'p-6'}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-slate-200 border-t-slate-950`}
      />
    </div>
  );
}
