'use client';

import { useState } from 'react';
import { Send, Users, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { sendRSVPFormToFamily } from '@/actions/guests';

interface Family {
  id: string;
  family_name: string;
  primary_contact_phone?: string;
  members_pending: number;
}

interface Props {
  families: Family[];
  eventId: string;
  eventName: string;
  eventDate?: string;
  onClose: () => void;
}

export function BulkRSVPActions({ families, eventId, eventName, eventDate, onClose }: Props) {
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ id: string; success: boolean; error?: string }[]>([]);
  const [completed, setCompleted] = useState(false);

  const pendingFamilies = families.filter(f => f.members_pending > 0 && f.primary_contact_phone);

  const toggleFamily = (familyId: string) => {
    const newSelected = new Set(selectedFamilies);
    if (newSelected.has(familyId)) {
      newSelected.delete(familyId);
    } else {
      newSelected.add(familyId);
    }
    setSelectedFamilies(newSelected);
  };

  const selectAll = () => {
    if (selectedFamilies.size === pendingFamilies.length) {
      setSelectedFamilies(new Set());
    } else {
      setSelectedFamilies(new Set(pendingFamilies.map(f => f.id)));
    }
  };

  const handleSendReminders = async () => {
    if (selectedFamilies.size === 0) return;

    setSending(true);
    const newResults: { id: string; success: boolean; error?: string }[] = [];

    for (const familyId of selectedFamilies) {
      const family = families.find(f => f.id === familyId);
      if (!family) continue;

      try {
        const baseUrl = window.location.origin;
        const result = await sendRSVPFormToFamily(
          familyId,
          eventId,
          eventName,
          eventDate || 'TBD',
          baseUrl
        );

        if (result.error) {
          newResults.push({ id: familyId, success: false, error: result.error });
        } else if (result.whatsappUrl) {
          // Open WhatsApp for each family - in production you might want to use a messaging API
          window.open(result.whatsappUrl, '_blank');
          newResults.push({ id: familyId, success: true });
        }
      } catch (error) {
        newResults.push({ id: familyId, success: false, error: 'Failed to send' });
      }
    }

    setResults(newResults);
    setCompleted(true);
    setSending(false);
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Send className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Send RSVP Reminders</h2>
              <p className="text-sm text-gray-600">
                {pendingFamilies.length} families with pending RSVPs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {completed ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">Reminders Sent!</h3>
                <p className="text-gray-600 mt-1">
                  {successCount} successful, {failCount} failed
                </p>
              </div>

              {failCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-2">Failed to send to:</p>
                  {results.filter(r => !r.success).map(r => {
                    const family = families.find(f => f.id === r.id);
                    return (
                      <p key={r.id} className="text-sm text-red-700">
                        {family?.family_name}: {r.error}
                      </p>
                    );
                  })}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingFamilies.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No families with pending RSVPs and phone numbers</p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <button
                      onClick={selectAll}
                      className="text-sm font-medium text-rose-700 hover:text-rose-800"
                    >
                      {selectedFamilies.size === pendingFamilies.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedFamilies.size} selected
                    </span>
                  </div>

                  {/* Family List */}
                  <div className="space-y-2">
                    {pendingFamilies.map(family => (
                      <button
                        key={family.id}
                        onClick={() => toggleFamily(family.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          selectedFamilies.has(family.id)
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedFamilies.has(family.id)
                            ? 'bg-rose-600 border-rose-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedFamilies.has(family.id) && (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{family.family_name}</p>
                          <p className="text-sm text-gray-500">
                            {family.members_pending} pending response{family.members_pending !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-sm text-blue-800">
                      This will open WhatsApp for each selected family. Each message includes personalized RSVP links for all family members.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!completed && pendingFamilies.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleSendReminders}
              disabled={selectedFamilies.size === 0 || sending}
              className="w-full py-2.5 bg-rose-700 text-white rounded-lg font-semibold hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to {selectedFamilies.size} Families
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
