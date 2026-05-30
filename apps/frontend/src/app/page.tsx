'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, ClipboardList, ShieldCheck, ShoppingBag, Wrench } from 'lucide-react';
import BrandMark from '@/components/shared/BrandMark';
import { useAuthStore } from '@/lib/store/auth.store';

const workflows = [
  { title: 'Resident commerce', text: 'Groceries, restaurant menus, carts, and order history.', icon: ShoppingBag },
  { title: 'Service desk', text: 'Time slots, booking requests, and maintenance tracking.', icon: Wrench },
  { title: 'Gate security', text: 'Visitor passes, approvals, entry logs, and history.', icon: ShieldCheck },
  { title: 'Association control', text: 'Resident records, reports, orders, and society settings.', icon: ClipboardList },
];

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case 'SUPER_ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'FLAT_ASSOCIATION':
        router.push('/association/dashboard');
        break;
      case 'SECURITY':
        router.push('/security/dashboard');
        break;
      case 'RESIDENT':
        router.push('/resident/dashboard');
        break;
      default:
        router.push('/login');
    }
  }, [user, router]);

  return (
    <main className="bg-[#f6f8f7] text-slate-950">
      <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80"
          alt="Premium apartment community"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.46]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.96),rgba(15,23,42,0.78)_46%,rgba(15,23,42,0.36))]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between">
            <BrandMark size="md" tone="dark" />
            <Link href="/login" className="btn-secondary border-white/15 bg-white/10 text-white hover:border-white/25 hover:bg-white/15">
              Login
              <ArrowRight size={17} />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-50 backdrop-blur">
                <Building2 size={15} />
                Smart apartment operations platform
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                CareTaker
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                A modern landing point for societies that need residents, security, associations, services, groceries, and food ordering in one connected workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="btn-primary bg-white text-slate-950 hover:bg-cyan-50">
                  Open portal
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {['Multi-tenant', 'Role based', 'Mobile ready', 'Flat secured'].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-semibold backdrop-blur">
                    <CheckCircle2 size={16} className="text-cyan-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {workflows.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                      <Icon size={22} />
                    </div>
                    <h2 className="text-lg font-bold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 pb-4 sm:grid-cols-3">
            {[
              ['Live', 'society workspaces'],
              ['Real', 'resident data'],
              ['4', 'role experiences'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-sm font-medium text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
