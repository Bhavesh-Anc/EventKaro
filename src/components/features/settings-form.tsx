'use client';

import { useState, useTransition } from 'react';
import { User, Building2, Bell, Lock } from 'lucide-react';
import { updateUserProfile } from '@/actions/auth';
import { updateOrganization } from '@/actions/organizations';

interface SettingsFormProps {
  user: {
    email: string;
    fullName: string;
    phone: string;
  };
  organization: {
    id: string;
    name: string;
  };
}

export function SettingsForm({ user, organization }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [orgName, setOrgName] = useState(organization.name);

  const [notifications, setNotifications] = useState({
    email: true,
    rsvp: true,
    tasks: true,
  });

  const handleProfileSave = () => {
    setError(null);
    setProfileSuccess(false);
    startTransition(async () => {
      const result = await updateUserProfile({ fullName, phone });
      if (result.error) {
        setError(result.error);
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    });
  };

  const handleOrgSave = () => {
    setError(null);
    setOrgSuccess(false);
    startTransition(async () => {
      const result = await updateOrganization(organization.id, { name: orgName });
      if (result.error) {
        setError(result.error);
      } else {
        setOrgSuccess(true);
        setTimeout(() => setOrgSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <User className="h-6 w-6 text-rose-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                <p className="text-sm text-gray-600">Manage your personal information</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleProfileSave}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
              {profileSuccess && (
                <span className="text-green-600 text-sm font-medium">Profile updated!</span>
              )}
            </div>
          </div>
        </div>

        {/* Organization Settings */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Building2 className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
                <p className="text-sm text-gray-600">Manage organization details</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={handleOrgSave}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-rose-900 text-white font-medium hover:from-rose-800 hover:to-rose-950 disabled:opacity-50"
              >
                {isPending ? 'Updating...' : 'Update Organization'}
              </button>
              {orgSuccess && (
                <span className="text-green-600 text-sm font-medium">Organization updated!</span>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Bell className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Configure notification preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">RSVP Updates</p>
                <p className="text-sm text-gray-600">Get notified when guests respond</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.rsvp}
                  onChange={(e) => setNotifications({ ...notifications, rsvp: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Task Reminders</p>
                <p className="text-sm text-gray-600">Reminders for upcoming tasks</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.tasks}
                  onChange={(e) => setNotifications({ ...notifications, tasks: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Notification preferences are saved automatically.
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Lock className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-600">Manage your account security</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              To change your password, use the password reset flow from the login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
