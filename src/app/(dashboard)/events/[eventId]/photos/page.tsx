import { getEvent } from '@/actions/events';
import {
  getEventPhotos,
  getPhotoStats,
  getPendingPhotos,
  generatePhotoUploadQR,
} from '@/actions/photos';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PhotosClient } from './photos-client';

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    redirect('/events');
  }

  const [photos, stats, pendingPhotos] = await Promise.all([
    getEventPhotos(eventId),
    getPhotoStats(eventId),
    getPendingPhotos(eventId),
  ]);

  // Generate upload QR URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const uploadQRUrl = await generatePhotoUploadQR(eventId, baseUrl);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href={`/events/${eventId}`}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          ← Back to Event
        </Link>
      </div>

      <PhotosClient
        eventId={eventId}
        eventName={event.title}
        photos={photos}
        pendingPhotos={pendingPhotos}
        stats={stats}
        uploadQRUrl={uploadQRUrl}
      />
    </div>
  );
}
