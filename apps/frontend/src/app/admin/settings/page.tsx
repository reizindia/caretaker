'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/shared/PageHeader';
import apiClient from '@/lib/api/client';

export default function AdminSettingsPage() {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || '';
  const [fleeMarketAdminPhone, setFleeMarketAdminPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/settings')
      .then((res) => setFleeMarketAdminPhone(res.data.fleeMarketAdminPhone || ''))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch('/settings', { fleeMarketAdminPhone });
      setFleeMarketAdminPhone(res.data.fleeMarketAdminPhone || '');
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Platform configuration" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input className="input-field" defaultValue="Caretaker" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Domain</label>
              <input className="input-field" value={appDomain} readOnly />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Flee Market</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Contact Number</label>
              <input
                className="input-field"
                value={fleeMarketAdminPhone}
                onChange={(e) => setFleeMarketAdminPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">All Flee Market call buttons will use this number.</p>
            </div>
            <button className="btn-primary" onClick={saveSettings} disabled={loading || saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
