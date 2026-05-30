'use client';

import { Database, RefreshCcw } from 'lucide-react';

export default function DatabaseUnavailablePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 text-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <Database size={24} />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Database not connected</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">Live database unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The app is configured to use the live database only. Check the backend database connection, then retry.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-6 w-full py-3 text-base">
          <RefreshCcw size={18} />
          Retry connection
        </button>
      </div>
    </main>
  );
}
