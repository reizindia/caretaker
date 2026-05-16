'use client';
import { Building2, Sparkles } from 'lucide-react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  subtitle?: string;
  tone?: 'light' | 'dark';
}

const sizes = {
  sm: {
    shell: 'h-9 w-9 rounded-lg',
    icon: 18,
    title: 'text-sm',
    subtitle: 'text-[11px]',
  },
  md: {
    shell: 'h-11 w-11 rounded-xl',
    icon: 21,
    title: 'text-base',
    subtitle: 'text-xs',
  },
  lg: {
    shell: 'h-16 w-16 rounded-2xl',
    icon: 30,
    title: 'text-2xl',
    subtitle: 'text-sm',
  },
};

export default function BrandMark({
  size = 'md',
  label = 'CareTaker',
  subtitle = 'Smart living operations',
  tone = 'light',
}: BrandMarkProps) {
  const styles = sizes[size];
  const dark = tone === 'dark';

  return (
    <div className="flex items-center gap-3">
      <div className={`${styles.shell} relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-950 text-white shadow-lg shadow-slate-950/15`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.85),transparent_36%),linear-gradient(135deg,#0f172a_15%,#2563eb_58%,#14b8a6_100%)]" />
        <Building2 size={styles.icon} className="relative z-10" strokeWidth={2.3} />
        <Sparkles size={10} className="absolute right-1.5 top-1.5 z-10 text-cyan-100" />
      </div>
      <div className="min-w-0">
        <div className={`${styles.title} truncate font-bold leading-tight ${dark ? 'text-white' : 'text-slate-950'}`}>{label}</div>
        <div className={`${styles.subtitle} truncate font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</div>
      </div>
    </div>
  );
}
