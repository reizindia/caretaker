'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTenant } from '@/lib/hooks/useTenant';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';
import {
  User, Phone, Mail, Home, Building2, Shield,
  LogOut, ChevronRight, Bell, Moon, Globe,
  Lock, HelpCircle, Info, Edit3, Check, X,
} from 'lucide-react';

export default function ResidentProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const { logout } = useAuth();
  const { tenant } = useTenant();

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [pwMode, setPwMode] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const themeColor = tenant?.themeColor || '#0f172a';

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    try {
      const res = await apiClient.patch(`/users/${user?.id}`, { name, phone });
      setAuth({ ...user!, name: res.data.name, phone: res.data.phone }, token || '');
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error('Fill all fields');
    if (newPw !== confirmPw) return toast.error('Passwords do not match');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await apiClient.patch(`/users/${user?.id}`, { password: newPw });
      toast.success('Password changed!');
      setPwMode(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    setTimeout(() => logout(), 500);
  };

  const roleLabel: Record<string, string> = {
    RESIDENT: 'Resident',
    SECURITY: 'Security',
    FLAT_ASSOCIATION: 'Association',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-32">
      {/* Profile header card */}
      <div
        className="rounded-3xl text-white overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, #0f172a 0%, ${themeColor} 100%)` }}
      >
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg bg-white/20 backdrop-blur"
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{user?.name}</h1>
              <p className="text-sm text-white/70">{user?.email}</p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                <Shield size={11} />
                {roleLabel[user?.role || ''] || user?.role}
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur hover:bg-white/25 transition"
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wide">Flat No.</p>
              <p className="text-sm font-bold">{user?.flatNumber || '—'}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5 backdrop-blur">
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wide">Society</p>
              <p className="text-sm font-bold truncate">{user?.flat?.name || tenant?.flatName || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile form */}
      {editMode && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-slate-950">Edit Profile</h2>
            <button onClick={() => setEditMode(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Phone Number</label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Check size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}

      {/* Account details */}
      <div className="card divide-y divide-slate-100">
        <h2 className="font-bold text-slate-950 mb-3 text-sm">Account Details</h2>
        <InfoRow icon={User} label="Full Name" value={user?.name || '—'} />
        <InfoRow icon={Mail} label="Email" value={user?.email || '—'} />
        <InfoRow icon={Phone} label="Phone" value={user?.phone || '—'} />
        <InfoRow icon={Home} label="Flat Number" value={user?.flatNumber || '—'} />
        <InfoRow icon={Building2} label="Society" value={user?.flat?.name || tenant?.flatName || '—'} />
        <InfoRow icon={Shield} label="Role" value={roleLabel[user?.role || ''] || '—'} />
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="font-bold text-slate-950 mb-3 text-sm">Security</h2>

        {!pwMode ? (
          <button
            onClick={() => setPwMode(true)}
            className="flex w-full items-center gap-3 rounded-2xl p-3 hover:bg-slate-50 transition text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Lock size={17} />
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-700">Change Password</span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-slate-700">Change Password</p>
              <button onClick={() => setPwMode(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <input
              type="password"
              className="input-field"
              placeholder="Current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="New password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleChangePassword}
                disabled={pwSaving}
                className="btn-primary flex-1"
              >
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
              <button onClick={() => setPwMode(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="card divide-y divide-slate-100">
        <h2 className="font-bold text-slate-950 mb-3 text-sm">Preferences</h2>
        <ActionRow icon={Bell} label="Notifications" iconBg="bg-blue-50 text-blue-600" comingSoon />
        <ActionRow icon={Moon} label="Dark Mode" iconBg="bg-slate-100 text-slate-600" comingSoon />
        <ActionRow icon={Globe} label="Language" iconBg="bg-emerald-50 text-emerald-600" comingSoon />
      </div>

      {/* Support */}
      <div className="card divide-y divide-slate-100">
        <h2 className="font-bold text-slate-950 mb-3 text-sm">Support</h2>
        <ActionRow icon={HelpCircle} label="Help & FAQ" iconBg="bg-cyan-50 text-cyan-600" comingSoon />
        <ActionRow icon={Info} label="About CareTaker" iconBg="bg-indigo-50 text-indigo-600" comingSoon />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-red-100 bg-red-50 py-4 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      <p className="text-center text-xs text-slate-400 pb-2">CareTaker · Smart Society Operations</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, iconBg, comingSoon }: { icon: any; label: string; iconBg: string; comingSoon?: boolean }) {
  return (
    <button className="flex w-full items-center gap-3 py-3 hover:bg-slate-50 rounded-xl px-1 transition">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon size={15} />
      </div>
      <span className="flex-1 text-left text-sm font-semibold text-slate-700">{label}</span>
      {comingSoon ? (
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Soon</span>
      ) : (
        <ChevronRight size={15} className="text-slate-400" />
      )}
    </button>
  );
}
