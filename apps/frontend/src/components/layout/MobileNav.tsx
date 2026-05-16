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
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur safe-bottom">
      <div className="flex p-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={19} strokeWidth={2.2} />
              <span className="mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
