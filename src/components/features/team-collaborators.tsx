'use client';

import { useState, useTransition } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
  Crown,
  Eye,
  Pencil,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  status: 'active' | 'pending' | 'declined';
}

interface Props {
  members: TeamMember[];
  currentUserId: string;
  eventName: string;
  onInvite?: (email: string, role: 'admin' | 'editor' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onRemove?: (memberId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateRole?: (memberId: string, role: 'admin' | 'editor' | 'viewer') => Promise<{ success: boolean; error?: string }>;
  onResendInvite?: (memberId: string) => Promise<{ success: boolean; error?: string }>;
}

const ROLES = [
  {
    value: 'owner',
    label: 'Owner',
    icon: Crown,
    description: 'Full access, can delete event',
    color: 'text-amber-600 bg-amber-100',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Can manage team and settings',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    value: 'editor',
    label: 'Editor',
    icon: Pencil,
    description: 'Can edit guests, vendors, budget',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    icon: Eye,
    description: 'Can view all data, no edits',
    color: 'text-gray-600 bg-gray-100',
  },
];

export function TeamCollaborators({
  members,
  currentUserId,
  eventName,
  onInvite,
  onRemove,
  onUpdateRole,
  onResendInvite,
}: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Active/Pending members
  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setError('This email is already a team member');
      return;
    }

    startTransition(async () => {
      if (onInvite) {
        const result = await onInvite(inviteEmail.trim(), inviteRole);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(true);
          setInviteEmail('');
          setTimeout(() => {
            setShowInviteModal(false);
            setSuccess(false);
          }, 1500);
        }
      }
    });
  };

  const getRoleInfo = (role: string) => ROLES.find((r) => r.value === role) || ROLES[3];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-600">Manage who can access and edit your wedding</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Role Legend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Role Permissions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.value} className="flex items-start gap-2">
                <div className={`p-1.5 rounded ${role.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{role.label}</p>
                  <p className="text-xs text-gray-500">{role.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Members */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-semibold text-gray-900">Active Members ({activeMembers.length})</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {activeMembers.map((member) => {
            const roleInfo = getRoleInfo(member.role);
            const RoleIcon = roleInfo.icon;
            const isCurrentUser = member.id === currentUserId;
            const isOwner = member.role === 'owner';

            return (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">You</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${roleInfo.color}`}>
                    <RoleIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{roleInfo.label}</span>
                  </div>

                  {!isOwner && !isCurrentUser && (
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                        <button
                          onClick={() => onUpdateRole?.(member.id, member.role === 'admin' ? 'editor' : 'admin')}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Change Role
                        </button>
                        <button
                          onClick={() => onRemove?.(member.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-amber-50">
            <h4 className="font-semibold text-amber-900">Pending Invites ({pendingMembers.length})</h4>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingMembers.map((member) => {
              const roleInfo = getRoleInfo(member.role);

              return (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.email}</p>
                      <p className="text-sm text-gray-500">
                        Invited {format(member.invitedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 text-sm font-medium bg-amber-100 text-amber-700 rounded-lg">
                      {roleInfo.label}
                    </span>
                    <button
                      onClick={() => onResendInvite?.(member.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Send className="h-4 w-4" />
                      Resend
                    </button>
                    <button
                      onClick={() => onRemove?.(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-4 space-y-4">
              {success ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Invitation Sent!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    They'll receive an email to join {eventName}
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="space-y-2">
                      {ROLES.filter((r) => r.value !== 'owner').map((role) => {
                        const Icon = role.icon;
                        return (
                          <label
                            key={role.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              inviteRole === role.value
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={inviteRole === role.value}
                              onChange={(e) => setInviteRole(e.target.value as any)}
                              className="sr-only"
                            />
                            <div className={`p-2 rounded ${role.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{role.label}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 px-4 py-2 bg-rose-700 text-white rounded-lg font-medium hover:bg-rose-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isPending ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
