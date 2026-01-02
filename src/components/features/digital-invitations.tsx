'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
  Mail,
  MessageSquare,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Users,
  Link as LinkIcon,
  Copy,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Sparkles,
  FileText,
  RefreshCw,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Invitation {
  id: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'rsvp_completed';
  sent_via: 'email' | 'whatsapp' | 'sms' | null;
  sent_at: string | null;
  opened_at: string | null;
  token: string;
  guest?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    whatsapp_number: string | null;
  };
}

interface InvitationStats {
  total: number;
  draft: number;
  sent: number;
  delivered: number;
  opened: number;
  rsvp_completed: number;
}

interface Props {
  eventId: string;
  eventName: string;
  invitations: Invitation[];
  stats: InvitationStats;
  onSendEmail: (invitationId: string) => Promise<void>;
  onSendWhatsApp: (invitationId: string) => Promise<void>;
  onBulkSend: (ids: string[], via: 'email' | 'whatsapp') => Promise<void>;
  onCreateForAll: () => Promise<void>;
  onCopyLink: (token: string) => void;
  baseUrl: string;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray', icon: FileText },
  sent: { label: 'Sent', color: 'blue', icon: Send },
  delivered: { label: 'Delivered', color: 'indigo', icon: Mail },
  opened: { label: 'Opened', color: 'amber', icon: Eye },
  rsvp_completed: { label: 'RSVP Done', color: 'green', icon: CheckCircle2 },
};

export function DigitalInvitations({
  eventId,
  eventName,
  invitations,
  stats,
  onSendEmail,
  onSendWhatsApp,
  onBulkSend,
  onCreateForAll,
  onCopyLink,
  baseUrl,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredInvitations = invitations.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = !searchQuery ||
      inv.guest?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.guest?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredInvitations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInvitations.map(i => i.id)));
    }
  };

  const handleBulkSend = (via: 'email' | 'whatsapp') => {
    startTransition(async () => {
      await onBulkSend(Array.from(selectedIds), via);
      setSelectedIds(new Set());
    });
  };

  const getInviteLink = (token: string) => `${baseUrl}/invite/${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getInviteLink(token));
    onCopyLink(token);
  };

  // Calculate funnel percentages
  const funnelData = [
    { label: 'Created', count: stats.total, percentage: 100 },
    { label: 'Sent', count: stats.sent + stats.delivered + stats.opened + stats.rsvp_completed, percentage: stats.total ? Math.round(((stats.sent + stats.delivered + stats.opened + stats.rsvp_completed) / stats.total) * 100) : 0 },
    { label: 'Opened', count: stats.opened + stats.rsvp_completed, percentage: stats.total ? Math.round(((stats.opened + stats.rsvp_completed) / stats.total) * 100) : 0 },
    { label: 'RSVP\'d', count: stats.rsvp_completed, percentage: stats.total ? Math.round((stats.rsvp_completed / stats.total) * 100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Digital Invitations</h2>
            <p className="text-white/80">{eventName}</p>
          </div>
          <button
            onClick={() => startTransition(() => onCreateForAll())}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Create for All Guests
          </button>
        </div>

        {/* Funnel Visualization */}
        <div className="grid grid-cols-4 gap-4">
          {funnelData.map((item, index) => (
            <div key={item.label} className="text-center">
              <div className="relative">
                <div
                  className="h-16 bg-white/20 rounded-lg flex items-center justify-center"
                  style={{
                    width: `${Math.max(50, item.percentage)}%`,
                    marginLeft: `${(100 - Math.max(50, item.percentage)) / 2}%`,
                  }}
                >
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              </div>
              <p className="text-sm mt-2 text-white/90">{item.label}</p>
              <p className="text-xs text-white/70">{item.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const Icon = config.icon;
          const count = stats[status as keyof InvitationStats] || 0;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                filterStatus === status
                  ? `border-${config.color}-400 bg-${config.color}-50`
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", `text-${config.color}-600`)} />
                <span className="text-sm font-medium text-gray-600">{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedIds.size} invitation{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkSend('email')}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              Send via Email
            </button>
            <button
              onClick={() => handleBulkSend('whatsapp')}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Send via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Invitations List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredInvitations.length && filteredInvitations.length > 0}
            onChange={selectAll}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-600 flex-1">Guest</span>
          <span className="text-sm font-medium text-gray-600 w-24">Status</span>
          <span className="text-sm font-medium text-gray-600 w-32">Sent Via</span>
          <span className="text-sm font-medium text-gray-600 w-40">Actions</span>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {filteredInvitations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No invitations found</p>
              <p className="text-sm mt-1">Create invitations for your guests to get started</p>
            </div>
          ) : (
            filteredInvitations.map((invitation) => {
              const statusConfig = STATUS_CONFIG[invitation.status];
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === invitation.id;

              return (
                <div key={invitation.id}>
                  <div className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(invitation.id)}
                      onChange={() => toggleSelect(invitation.id)}
                      className="rounded border-gray-300"
                    />

                    {/* Guest Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {invitation.guest?.name || 'Unknown Guest'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {invitation.guest?.email || invitation.guest?.phone || 'No contact info'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="w-24">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        `bg-${statusConfig.color}-100 text-${statusConfig.color}-700`
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Sent Via */}
                    <div className="w-32 text-sm text-gray-600">
                      {invitation.sent_via ? (
                        <span className="flex items-center gap-1">
                          {invitation.sent_via === 'email' ? (
                            <Mail className="h-3 w-3" />
                          ) : (
                            <MessageSquare className="h-3 w-3" />
                          )}
                          {invitation.sent_via === 'email' ? 'Email' : 'WhatsApp'}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not sent</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-40 flex items-center gap-1">
                      {invitation.status === 'draft' && (
                        <>
                          {invitation.guest?.email && (
                            <button
                              onClick={() => startTransition(() => onSendEmail(invitation.id))}
                              disabled={isPending}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Send via Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          )}
                          {(invitation.guest?.whatsapp_number || invitation.guest?.phone) && (
                            <button
                              onClick={() => startTransition(() => onSendWhatsApp(invitation.id))}
                              disabled={isPending}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Send via WhatsApp"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => copyLink(invitation.token)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Copy Link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={getInviteLink(invitation.token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Preview"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : invitation.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Invitation Link</p>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="text"
                              readOnly
                              value={getInviteLink(invitation.token)}
                              className="flex-1 px-2 py-1 bg-white border rounded text-xs font-mono"
                            />
                            <button
                              onClick={() => copyLink(invitation.token)}
                              className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {invitation.sent_at && (
                          <div>
                            <p className="text-gray-500">Sent At</p>
                            <p className="font-medium mt-1">
                              {format(new Date(invitation.sent_at), 'd MMM yyyy, h:mm a')}
                            </p>
                          </div>
                        )}
                        {invitation.opened_at && (
                          <div>
                            <p className="text-gray-500">Opened At</p>
                            <p className="font-medium mt-1">
                              {format(new Date(invitation.opened_at), 'd MMM yyyy, h:mm a')}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="font-medium mt-1">
                            {invitation.guest?.email || invitation.guest?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
