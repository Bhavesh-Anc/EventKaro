'use client';

import { useState } from 'react';
import { Check, Copy, Mail, MessageCircle } from 'lucide-react';

interface GuestInvitationActionsProps {
  invitationToken: string | null;
  invitationExpiresAt: string | null;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
}

export default function GuestInvitationActions({
  invitationToken,
  invitationExpiresAt,
  guestName,
  guestEmail,
  guestPhone,
}: GuestInvitationActionsProps) {
  const [copied, setCopied] = useState(false);

  if (!invitationToken) {
    return <span className="text-xs text-gray-400">No invitation</span>;
  }

  // Check if invitation is expired
  const isExpired = invitationExpiresAt && new Date(invitationExpiresAt) < new Date();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                  (typeof window !== 'undefined' ? window.location.origin : '');
  const invitationUrl = `${baseUrl}/rsvp/${invitationToken}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('RSVP to Our Event');
    const body = encodeURIComponent(
      `Hi ${guestName},\n\nYou're invited! Please RSVP using this link:\n${invitationUrl}\n\nLooking forward to seeing you!`
    );

    if (guestEmail) {
      window.open(`mailto:${guestEmail}?subject=${subject}&body=${body}`, '_blank');
    } else {
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi ${guestName}! You're invited to our event. Please RSVP here: ${invitationUrl}`
    );

    const phoneNumber = guestPhone?.replace(/\D/g, ''); // Remove non-digits
    const url = phoneNumber
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, '_blank');
  };

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Expired</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Copy invitation link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Send Email Button */}
      <button
        onClick={handleSendEmail}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Send via email"
      >
        <Mail className="h-4 w-4 text-gray-600" />
      </button>

      {/* Send WhatsApp Button */}
      <button
        onClick={handleSendWhatsApp}
        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
        title="Send via WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
}
