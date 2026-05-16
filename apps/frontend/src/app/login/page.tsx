'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import BrandMark from '@/components/shared/BrandMark';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, redirectByRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      redirectByRole(user);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(135deg,#0f172a_0%,#155e75_52%,#14b8a6_100%)]" />
      <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden text-white lg:block">
          <div className="mb-8">
            <BrandMark size="lg" tone="dark" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-cyan-50 backdrop-blur">
            <Sparkles size={15} />
            Demo society operations suite
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-normal">
            One polished workspace for residents, security, and association teams.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            Manage grocery requests, food orders, service bookings, gate passes, and building reports from a single branded web app.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
            {['Resident self-service', 'Security desk workflow', 'Association reports', 'Admin controls'].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
                <CheckCircle2 size={17} className="text-cyan-200" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="panel mx-auto w-full max-w-md overflow-hidden p-2">
          <div className="rounded-[1.25rem] bg-white p-6 sm:p-8">
            <div className="mb-8 lg:hidden">
              <BrandMark size="md" />
            </div>
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Welcome back</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Sign in to CareTaker</h2>
              <p className="mt-2 text-sm text-slate-500">Use a demo account below to explore the web app.</p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email or Phone</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@caretaker.com"
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
                  className="input-field pl-10"
                  placeholder="password123"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ShieldCheck size={18} className="text-cyan-700" />
              Demo credentials
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <p><span className="font-semibold text-slate-800">Super Admin:</span> admin@caretaker.com</p>
              <p><span className="font-semibold text-slate-800">ABC Resident:</span> resident@abc.com</p>
              <p><span className="font-semibold text-slate-800">ABC Security:</span> security@abc.com</p>
              <p><span className="font-semibold text-slate-800">ABC Association:</span> association@abc.com</p>
              <p className="rounded-xl bg-white px-3 py-2 font-medium text-slate-500">Password for all: password123</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
