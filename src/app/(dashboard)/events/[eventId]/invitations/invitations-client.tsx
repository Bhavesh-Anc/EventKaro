'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DigitalInvitations } from '@/components/features/digital-invitations';
import {
  createInvitationsForAllGuests,
  sendInvitationEmail,
  sendInvitationWhatsApp,
  bulkSendInvitations,
} from '@/actions/invitations';

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
}

export function InvitationsClient({ eventId, eventName, invitations, stats }: Props) {
  const router = useRouter();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleSendEmail = async (invitationId: string) => {
    await sendInvitationEmail(invitationId);
    router.refresh();
  };

  const handleSendWhatsApp = async (invitationId: string) => {
    await sendInvitationWhatsApp(invitationId);
    router.refresh();
  };

  const handleBulkSend = async (ids: string[], via: 'email' | 'whatsapp') => {
    await bulkSendInvitations(ids, via);
    router.refresh();
  };

  const handleCreateForAll = async () => {
    await createInvitationsForAllGuests(eventId);
    router.refresh();
  };

  const handleCopyLink = (token: string) => {
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <DigitalInvitations
      eventId={eventId}
      eventName={eventName}
      invitations={invitations}
      stats={stats}
      onSendEmail={handleSendEmail}
      onSendWhatsApp={handleSendWhatsApp}
      onBulkSend={handleBulkSend}
      onCreateForAll={handleCreateForAll}
      onCopyLink={handleCopyLink}
      baseUrl={baseUrl}
    />
  );
}
