'use client';

import { useRouter } from 'next/navigation';
import { EmergencyContacts } from '@/components/features/emergency-contacts';
import {
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '@/actions/emergency-contacts';

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: string;
  category: 'medical' | 'security' | 'family' | 'vendor' | 'emergency_services' | 'transport' | 'other';
  isPrimary?: boolean;
  notes?: string;
  available24x7?: boolean;
}

interface Props {
  eventId: string;
  initialContacts: Contact[];
  venueName?: string;
  venueAddress?: string;
}

export function EmergencyContactsClient({
  eventId,
  initialContacts,
  venueName,
  venueAddress,
}: Props) {
  const router = useRouter();

  const handleAdd = async (contact: Omit<Contact, 'id'>) => {
    await addEmergencyContact(eventId, contact);
    router.refresh();
  };

  const handleUpdate = async (id: string, updates: Partial<Contact>) => {
    await updateEmergencyContact(id, updates);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteEmergencyContact(id);
    router.refresh();
  };

  return (
    <EmergencyContacts
      eventId={eventId}
      contacts={initialContacts}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      venueName={venueName}
      venueAddress={venueAddress}
    />
  );
}
