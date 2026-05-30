'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export default function MobileNav({ items }: { items: NavItem[]; basePath?: string }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-3 bottom-4 z-40 safe-bottom">
      <div
        className="flex rounded-2xl border border-slate-200/80 bg-white p-1.5"
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset',
          backdropFilter: 'blur(16px)',
        }}
      >
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-slate-950 text-white shadow-[0_2px_8px_rgba(15,23,42,0.22)]'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon
                size={isActive ? 19 : 18}
                strokeWidth={isActive ? 2.4 : 2}
                className="transition-all duration-200"
              />
              <span className={`truncate transition-all duration-200 ${isActive ? 'text-[10px]' : 'text-[9px]'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-slate-950/30" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
