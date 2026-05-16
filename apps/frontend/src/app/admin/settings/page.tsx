'use client';
import PageHeader from '@/components/shared/PageHeader';

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Platform configuration" />
      <div className="card max-w-lg">
        <h2 className="font-semibold mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input className="input-field" defaultValue="Caretaker" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Domain</label>
            <input className="input-field" defaultValue="caretakerapp.com" />
          </div>
          <button className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
