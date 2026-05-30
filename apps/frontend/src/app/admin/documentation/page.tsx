'use client';
import PageHeader from '@/components/shared/PageHeader';
import { CheckCircle2, Database, Globe2, ShieldCheck } from 'lucide-react';

const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'your-domain.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Set NEXT_PUBLIC_API_URL';

const launchChecks = [
  'Create real flats from the Super Admin Flats page.',
  'Create real association, security, and resident users for each flat.',
  'Use strong unique passwords and rotate any temporary launch passwords.',
  'Confirm every tenant opens on its own subdomain before inviting residents.',
];

export default function AdminDocumentationPage() {
  return (
    <div>
      <PageHeader title="Production Notes" description="Live environment configuration and launch checks" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <Globe2 className="mb-3 text-cyan-700" size={24} />
          <h2 className="font-bold text-slate-950">Domain</h2>
          <p className="mt-2 text-sm text-slate-500">Tenant URLs use <span className="font-semibold text-slate-700">slug.{appDomain}</span>.</p>
        </div>
        <div className="card">
          <Database className="mb-3 text-emerald-700" size={24} />
          <h2 className="font-bold text-slate-950">API</h2>
          <p className="mt-2 break-all text-sm text-slate-500">{apiUrl}</p>
        </div>
        <div className="card">
          <ShieldCheck className="mb-3 text-indigo-700" size={24} />
          <h2 className="font-bold text-slate-950">Security</h2>
          <p className="mt-2 text-sm text-slate-500">Tenant isolation is enforced by flat context and role guards.</p>
        </div>
      </div>

      <div className="card mt-5">
        <h2 className="mb-4 font-bold text-slate-950">Launch Checklist</h2>
        <div className="space-y-3">
          {launchChecks.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
