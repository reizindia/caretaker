'use client';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  subtitle?: string;
  tone?: 'light' | 'dark';
}

const sizes = {
  sm: { shell: 'h-8 w-8 rounded-lg', image: 'h-8 w-8', title: 'text-sm', subtitle: 'text-[10px]' },
  md: { shell: 'h-9 w-9 rounded-xl', image: 'h-9 w-9', title: 'text-sm', subtitle: 'text-[11px]' },
  lg: { shell: 'h-14 w-14 rounded-2xl', image: 'h-14 w-14', title: 'text-xl', subtitle: 'text-xs' },
};

export default function BrandMark({
  size = 'md',
  label = 'CareTaker',
  subtitle = 'Smart living platform',
  tone = 'light',
}: BrandMarkProps) {
  const styles = sizes[size];
  const dark = tone === 'dark';

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo icon */}
      <div
        className={`${styles.shell} relative flex shrink-0 items-center justify-center overflow-hidden bg-white`}
        style={{ boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(15,23,42,0.14)' }}
      >
        <img src="/image.png" alt="CareTaker" className={`${styles.image} object-cover`} />
      </div>

      {/* Text */}
      <div className="min-w-0">
        <div className={`${styles.title} truncate font-bold leading-tight ${dark ? 'text-white' : 'text-slate-950'}`}>
          {label}
        </div>
        <div className={`${styles.subtitle} truncate font-medium leading-tight ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
