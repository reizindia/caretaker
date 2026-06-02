'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  header: React.ReactNode;
  footer: React.ReactNode;
  activeStyle?: string;
  inactiveStyle?: string;
  sidebarBg?: string;
  theme?: 'dark' | 'light';
}

export default function AppShell({
  children,
  navItems,
  header,
  footer,
  activeStyle = 'bg-white text-slate-950 shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
  inactiveStyle = 'text-slate-400 hover:bg-white/8 hover:text-white',
  sidebarBg = 'bg-slate-950',
  theme = 'dark',
}: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isLight = theme === 'light';
  const borderClass = isLight ? 'border-slate-100' : 'border-white/8';
  const closeBtnClass = isLight
    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950'
    : 'bg-white/10 text-white/80 hover:bg-white/18 hover:text-white';
  const openBtnClass = isLight
    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950'
    : 'bg-white/10 text-white hover:bg-white/20';

  const sidebar = (
    <div className={`flex h-full flex-col ${sidebarBg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b ${borderClass} px-5 py-4`}>
        {header}
        <button
          onClick={() => setOpen(false)}
          className={`lg:hidden flex h-8 w-8 items-center justify-center rounded-xl transition ${closeBtnClass}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive ? activeStyle : inactiveStyle
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                isActive
                  ? isLight ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-950'
                  : isLight
                    ? 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-950'
                    : 'bg-white/6 text-slate-400 group-hover:bg-white/12 group-hover:text-white'
              }`}>
                <Icon size={15} strokeWidth={2.2} />
              </div>
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-slate-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t ${borderClass} p-4`}>
        {footer}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.18)' }}>
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:hidden transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ boxShadow: '4px 0 32px rgba(0,0,0,0.25)' }}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile top bar */}
        <div className={`sticky top-0 z-30 flex items-center gap-3 border-b ${borderClass} ${sidebarBg} px-4 py-3 lg:hidden`}
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
          <button
            onClick={() => setOpen(true)}
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${openBtnClass}`}
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            {header}
          </div>
        </div>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
