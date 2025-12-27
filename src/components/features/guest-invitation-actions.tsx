'use client';

import { useState } from 'react';
import { Check, Copy, Mail, MessageCircle, Loader2 } from 'lucide-react';

interface GuestInvitationActionsProps {
  invitationToken: string | null;
  invitationExpiresAt: string | null;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
}

export default function GuestInvitationActions({
  invitationToken,
  invitationExpiresAt,
  guestName,
  guestEmail,
  guestPhone,
  eventTitle,
  eventDate,
  eventLocation,
}: GuestInvitationActionsProps) {
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handleSendEmail = async () => {
    if (!guestEmail) {
      alert('No email address for this guest');
      return;
    }

    if (!eventTitle || !eventDate) {
      // Fallback to mailto if event details not provided
      const subject = encodeURIComponent('RSVP to Our Event');
      const body = encodeURIComponent(
        `Hi ${guestName},\n\nYou're invited! Please RSVP using this link:\n${invitationUrl}\n\nLooking forward to seeing you!`
      );
      window.open(`mailto:${guestEmail}?subject=${subject}&body=${body}`, '_blank');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          guestEmail,
          eventTitle,
          eventDate,
          eventLocation,
          invitationUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error: any) {
      console.error('Error sending invitation email:', error);
      alert(error.message || 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
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
        disabled={sendingEmail || !guestEmail}
        className={`p-1.5 rounded transition-colors ${
          sendingEmail || !guestEmail
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-100'
        }`}
        title={!guestEmail ? 'No email address' : 'Send via email'}
      >
        {sendingEmail ? (
          <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
        ) : emailSent ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Mail className="h-4 w-4 text-gray-600" />
        )}
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
