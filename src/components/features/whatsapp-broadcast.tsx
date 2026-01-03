'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Send,
  Users,
  Check,
  Clock,
  AlertCircle,
  Plus,
  Copy,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppBroadcastProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  guests: {
    id: string;
    name: string;
    phone?: string;
    whatsapp_number?: string;
    rsvp_status: string;
  }[];
  families: {
    id: string;
    family_name: string;
    primary_contact_phone?: string;
    member_count: number;
    members_pending: number;
  }[];
}

const MESSAGE_TEMPLATES = [
  {
    id: 'invitation',
    name: 'Wedding Invitation',
    template: `Hi {name}! 🎉

You're cordially invited to {event_name} on {event_date}.

We would be honored by your presence. Please confirm your attendance by clicking the RSVP link below:

{rsvp_link}

Looking forward to celebrating with you!

With love,
{couple_names}`,
  },
  {
    id: 'rsvp_reminder',
    name: 'RSVP Reminder',
    template: `Hi {name}! 👋

This is a friendly reminder to RSVP for {event_name} on {event_date}.

We haven't received your response yet. Please let us know if you'll be joining us:

{rsvp_link}

We hope to see you there! 🙏`,
  },
  {
    id: 'event_update',
    name: 'Event Update',
    template: `Hi {name}! 📢

Important update for {event_name}:

{update_message}

If you have any questions, please reach out to us.

Thank you!`,
  },
  {
    id: 'logistics',
    name: 'Logistics Information',
    template: `Hi {name}! 🚗

Here are the logistics details for {event_name}:

📍 Venue: {venue_name}
📅 Date: {event_date}
⏰ Time: {event_time}

🏨 Accommodation: {hotel_name}
🚌 Pickup: {pickup_time} from {pickup_location}

Please save these details. See you soon!`,
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    template: `Dear {name},

Thank you so much for being part of our special day! 💕

Your presence made our wedding truly memorable. We are grateful for your blessings and love.

Here's the link to view wedding photos: {photos_link}

With love and gratitude,
{couple_names}`,
  },
];

export function WhatsAppBroadcast({
  eventId,
  eventName,
  eventDate,
  guests,
  families,
}: WhatsAppBroadcastProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [recipientType, setRecipientType] = useState<'all' | 'pending' | 'confirmed' | 'custom'>('pending');
  const [showPreview, setShowPreview] = useState(false);

  // Filter guests with phone numbers
  const guestsWithPhone = guests.filter(g => g.phone || g.whatsapp_number);
  const familiesWithPhone = families.filter(f => f.primary_contact_phone);

  // Get recipients based on filter
  const getRecipients = () => {
    switch (recipientType) {
      case 'pending':
        return guestsWithPhone.filter(g => g.rsvp_status === 'pending');
      case 'confirmed':
        return guestsWithPhone.filter(g => g.rsvp_status === 'accepted');
      case 'custom':
        return guestsWithPhone.filter(g => selectedRecipients.has(g.id));
      default:
        return guestsWithPhone;
    }
  };

  const recipients = getRecipients();

  // Generate WhatsApp link for a single recipient
  const generateWhatsAppLink = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  // Personalize message
  const personalizeMessage = (template: string, recipient: { name: string }) => {
    return template
      .replace(/{name}/g, recipient.name)
      .replace(/{event_name}/g, eventName)
      .replace(/{event_date}/g, new Date(eventDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }))
      .replace(/{rsvp_link}/g, '[RSVP Link will be inserted]')
      .replace(/{couple_names}/g, eventName.replace("'s Wedding", ''));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">With WhatsApp</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{guestsWithPhone.length}</p>
          <p className="text-xs text-gray-500">of {guests.length} guests</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Pending RSVP</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">
            {guestsWithPhone.filter(g => g.rsvp_status === 'pending').length}
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Families</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{familiesWithPhone.length}</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Send className="h-4 w-4" />
            <span className="text-sm">Selected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{recipients.length}</p>
        </div>
      </div>

      {/* Message Template Selection */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Message Template</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
          {MESSAGE_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all",
                selectedTemplate.id === template.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-green-300"
              )}
            >
              <p className="font-medium text-gray-900 text-sm">{template.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Filter */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Select Recipients</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['all', 'pending', 'confirmed', 'custom'] as const).map(type => (
            <button
              key={type}
              onClick={() => setRecipientType(type)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                recipientType === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {type === 'all' && `All (${guestsWithPhone.length})`}
              {type === 'pending' && `Pending RSVP (${guestsWithPhone.filter(g => g.rsvp_status === 'pending').length})`}
              {type === 'confirmed' && `Confirmed (${guestsWithPhone.filter(g => g.rsvp_status === 'accepted').length})`}
              {type === 'custom' && `Custom (${selectedRecipients.size})`}
            </button>
          ))}
        </div>

        {recipientType === 'custom' && (
          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
            {guestsWithPhone.map(guest => (
              <label
                key={guest.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.has(guest.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedRecipients);
                    if (e.target.checked) {
                      newSelected.add(guest.id);
                    } else {
                      newSelected.delete(guest.id);
                    }
                    setSelectedRecipients(newSelected);
                  }}
                  className="h-4 w-4 text-green-600 rounded"
                />
                <span className="flex-1">{guest.name}</span>
                <span className="text-sm text-gray-500">
                  {guest.whatsapp_number || guest.phone}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Message Preview */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Message Preview</h3>
          <button
            onClick={() => copyToClipboard(selectedTemplate.template)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Copy className="h-4 w-4" />
            Copy Template
          </button>
        </div>

        <div className="bg-[#DCF8C6] rounded-lg p-4 max-w-md">
          <p className="text-sm whitespace-pre-wrap">
            {personalizeMessage(selectedTemplate.template, { name: '[Guest Name]' })}
          </p>
        </div>
      </div>

      {/* Send Options */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Send Messages
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Ready to send to <strong>{recipients.length}</strong> recipients
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Open WhatsApp Web for each recipient */}
            <button
              onClick={() => {
                if (recipients.length === 0) return;
                const firstRecipient = recipients[0];
                const phone = firstRecipient.whatsapp_number || firstRecipient.phone;
                if (phone) {
                  const message = personalizeMessage(selectedTemplate.template, {
                    name: firstRecipient.name,
                  });
                  window.open(generateWhatsAppLink(phone, message), '_blank');
                }
              }}
              disabled={recipients.length === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
                recipients.length > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
              Open WhatsApp
            </button>

            {/* Copy all numbers */}
            <button
              onClick={() => {
                const numbers = recipients
                  .map(r => r.whatsapp_number || r.phone)
                  .filter(Boolean)
                  .join(', ');
                copyToClipboard(numbers);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4" />
              Copy All Numbers
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Note: WhatsApp will open in a new tab for each recipient. Due to WhatsApp's policies,
            bulk messaging requires sending individually.
          </p>
        </div>
      </div>

      {/* Quick Send to Families */}
      {familiesWithPhone.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Quick Send to Families with Pending RSVPs
          </h3>
          <div className="space-y-3">
            {familiesWithPhone
              .filter(f => f.members_pending > 0)
              .map(family => (
                <div
                  key={family.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-gray-900">{family.family_name}</p>
                    <p className="text-sm text-gray-600">
                      {family.members_pending} of {family.member_count} pending
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const message = personalizeMessage(
                        MESSAGE_TEMPLATES[1].template,
                        { name: family.family_name + ' family' }
                      );
                      window.open(
                        generateWhatsAppLink(family.primary_contact_phone!, message),
                        '_blank'
                      );
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Reminder
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
