'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ConciergeBell,
  Database,
  LockKeyhole,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrandMark from '@/components/shared/BrandMark';
import { useAuth } from '@/lib/hooks/useAuth';

const PLATFORM_POINTS = ['Groceries', 'Food orders', 'Service bookings', 'Gate passes'];
const TENANT_POINTS = ['Resident requests', 'Visitor approvals', 'Daily essentials', 'Local services'];
const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_LOGIN_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80';

function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.host;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  if (appDomain && host.endsWith(`.${appDomain}`)) {
    const sub = host.replace(`.${appDomain}`, '');
    if (sub && sub !== 'www' && sub !== 'admin') return sub;
    return null;
  }

  if (!isProduction && host.includes('.localhost')) return host.split('.')[0];

  const params = new URLSearchParams(window.location.search);
  return isProduction ? null : params.get('tenant');
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState('');
  const { login, register, redirectByRole } = useAuth();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setDatabaseError('API is not configured. Set NEXT_PUBLIC_API_URL to the live backend.');
      setTenantLoading(false);
      return;
    }

    const slug = getTenantSlug();
    setTenantSlug(slug);

    fetch(`${apiUrl}/health`, { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok || data?.database !== 'connected') {
          throw new Error(data?.message || 'Database not connected. Please check the live database connection.');
        }
        if (!slug) return null;

        const tenantResponse = await fetch(`${apiUrl}/tenant/by-slug/${slug}`, { cache: 'no-store' });
        return tenantResponse.ok ? tenantResponse.json() : null;
      })
      .then((data) => {
        setTenant(data);
        setDatabaseError('');
      })
      .catch((error) => {
        setTenant(null);
        setDatabaseError(error?.message || 'Database not connected. Please check the live database connection.');
      })
      .finally(() => setTenantLoading(false));
  }, []);

  const isTenantLogin = !!tenant;
  const themeColor = tenant?.themeColor || '#0f766e';
  const points = isTenantLogin ? TENANT_POINTS : PLATFORM_POINTS;
  const heroImage = tenant?.imageUrl || DEFAULT_LOGIN_IMAGE;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '';
  const mainPortalHref = appDomain && typeof window !== 'undefined' ? `${window.location.protocol}//${appDomain}/login` : '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password, isTenantLogin ? tenant.slug : tenantSlug);

      toast.success(`Welcome back, ${user.name}!`);
      redirectByRole(user);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.slug) {
      toast.error('Registration is available only from your apartment URL.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        ...registerForm,
        tenantSlug: tenant.slug,
      });
      toast.success(`Welcome, ${user.name}!`);
      redirectByRole(user);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-cyan-300" />
      </div>
    );
  }

  if (databaseError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 text-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Database size={24} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Database not connected</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">Live database unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{databaseError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary mt-6 w-full py-3 text-base"
          >
            <RefreshCcw size={18} />
            Retry connection
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
          <img
            src={heroImage}
            alt={isTenantLogin ? tenant.flatName : 'Modern apartment building'}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96),rgba(15,23,42,0.72)_50%,rgba(15,23,42,0.16))]" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
            {isTenantLogin ? (
              <div className="flex items-center gap-3">
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt={tenant.flatName} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: themeColor }}>
                    {tenant.flatName?.[0] || <Building2 size={24} />}
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold">{tenant.flatName}</p>
                  <p className="text-sm text-slate-300">Society portal</p>
                </div>
              </div>
            ) : (
              <BrandMark size="lg" tone="dark" />
            )}

            <div className="max-w-2xl pb-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-cyan-50 backdrop-blur">
                <Sparkles size={15} />
                {isTenantLogin ? 'Private society workspace' : 'Complete apartment operations suite'}
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-normal xl:text-6xl">
                {isTenantLogin ? `Welcome home to ${tenant.flatName}` : 'Run apartment life from one calm dashboard.'}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
                {isTenantLogin
                  ? 'Book essentials, request services, manage visitors, and track every apartment task from a branded portal built for your community.'
                  : 'CareTaker brings residents, security, associations, food vendors, groceries, and maintenance teams into one modern operating layer.'}
              </p>
              <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
                {points.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur">
                    <CheckCircle2 size={17} className="text-cyan-200" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3">
              {[
                ['24/7', 'Security desk'],
                ['4', 'Role portals'],
                ['100%', 'Tenant branded'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs font-medium text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute inset-x-0 top-0 h-56 lg:hidden">
            <img src={heroImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-[#f5f7f6]" />
          </div>
          <div className="w-full max-w-md">
            <div className="relative mb-8 lg:hidden">
              {isTenantLogin ? (
                <div className="flex items-center gap-3">
                  {tenant.logoUrl ? (
                    <img src={tenant.logoUrl} alt={tenant.flatName} className="h-11 w-11 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: themeColor }}>
                      {tenant.flatName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-950">{tenant.flatName}</p>
                    <p className="text-xs font-medium text-slate-500">Society portal</p>
                  </div>
                </div>
              ) : (
                <BrandMark size="md" />
              )}
            </div>

            <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-8">
              <div className="mb-7">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                  <ShieldCheck size={22} />
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: isTenantLogin ? themeColor : '#0f766e' }}>
                  {mode === 'register' ? 'Resident registration' : 'Secure sign in'}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
                  {mode === 'register' ? `Join ${tenant.flatName}` : isTenantLogin ? `Enter ${tenant.flatName}` : 'Enter CareTaker'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === 'register'
                    ? 'Create your resident account for this apartment. Your flat number is required.'
                    : isTenantLogin
                    ? 'Use your resident, security, or association account for this apartment.'
                    : 'Sign in with your platform administrator account.'}
                </p>
              </div>

              {isTenantLogin && (
                <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-100 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`rounded-lg py-2 text-sm font-bold transition ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`rounded-lg py-2 text-sm font-bold transition ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400'}`}
                  >
                    Register
                  </button>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email or phone</label>
                    <div className="relative">
                      <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field h-12 pl-10"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <LockKeyhole size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field h-12 pl-10"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base"
                    style={isTenantLogin ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label>
                    <div className="relative">
                      <UserPlus size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className="input-field h-12 pl-10" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} placeholder="Your name" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                    <div className="relative">
                      <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" className="input-field h-12 pl-10" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="name@example.com" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
                      <div className="relative">
                        <Phone size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input className="input-field h-12 pl-10" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Flat number *</label>
                      <input className="input-field h-12" value={registerForm.flatNumber} onChange={(e) => setRegisterForm({ ...registerForm, flatNumber: e.target.value })} placeholder="A-101" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <LockKeyhole size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" minLength={6} className="input-field h-12 pl-10" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} placeholder="Create password" required />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base"
                    style={{ backgroundColor: themeColor, borderColor: themeColor }}
                  >
                    {loading ? 'Creating account...' : 'Create resident account'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                {isTenantLogin ? (
                  <a href={mainPortalHref} className="inline-flex items-center gap-1 transition hover:text-slate-800">
                    <ArrowLeft size={14} />
                    Main portal
                  </a>
                ) : (
                  <span>Use your assigned apartment URL to access tenant login.</span>
                )}
                <span className="inline-flex items-center gap-1">
                  <ConciergeBell size={14} />
                  CareTaker
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
