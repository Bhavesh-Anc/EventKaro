'use client';

import { useState } from 'react';
import { createDefaultWeddingEvents } from '@/actions/wedding-events';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Props {
  eventId: string;
  weddingDate: string;
}

export function CreateDefaultEventsButton({ eventId, weddingDate }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createDefaultWeddingEvents(eventId, weddingDate.split('T')[0]);
      toast({
        title: 'Success!',
        description: '6 default wedding events created',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create events',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={loading}
      size="lg"
      className="bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-rose-950"
    >
      {loading ? 'Creating...' : '✨ Create Default Wedding Events'}
    </Button>
  );
}
