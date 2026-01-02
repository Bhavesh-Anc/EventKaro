'use client';

import { useRouter } from 'next/navigation';
import { PhotoGallery } from '@/components/features/photo-gallery';
import {
  uploadPhoto,
  deletePhoto,
  togglePhotoFeatured,
  moderatePhoto,
  likePhoto,
} from '@/actions/photos';

interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  category: string;
  uploaded_by: 'host' | 'photographer' | 'guest';
  uploader_name?: string;
  is_featured: boolean;
  is_approved: boolean;
  likes_count: number;
  created_at: string;
}

interface PhotoStats {
  total: number;
  approved: number;
  pending: number;
  byCategory: Record<string, number>;
  byUploader: Record<string, number>;
}

interface Props {
  eventId: string;
  eventName: string;
  photos: Photo[];
  pendingPhotos: Photo[];
  stats: PhotoStats;
  uploadQRUrl: string;
}

export function PhotosClient({
  eventId,
  eventName,
  photos,
  pendingPhotos,
  stats,
  uploadQRUrl,
}: Props) {
  const router = useRouter();

  const handleUpload = async (data: {
    url: string;
    caption?: string;
    category: string;
    is_featured?: boolean;
  }) => {
    await uploadPhoto(eventId, {
      url: data.url,
      caption: data.caption,
      category: data.category as Photo['category'],
      is_featured: data.is_featured,
    });
    router.refresh();
  };

  const handleDelete = async (photoId: string) => {
    await deletePhoto(photoId);
    router.refresh();
  };

  const handleToggleFeatured = async (photoId: string) => {
    await togglePhotoFeatured(photoId);
    router.refresh();
  };

  const handleApprove = async (photoId: string) => {
    await moderatePhoto(photoId, true);
    router.refresh();
  };

  const handleReject = async (photoId: string) => {
    await moderatePhoto(photoId, false);
    router.refresh();
  };

  const handleLike = async (photoId: string) => {
    await likePhoto(photoId);
    router.refresh();
  };

  return (
    <PhotoGallery
      eventId={eventId}
      eventName={eventName}
      photos={photos}
      pendingPhotos={pendingPhotos}
      stats={stats}
      onUpload={handleUpload}
      onDelete={handleDelete}
      onToggleFeatured={handleToggleFeatured}
      onApprove={handleApprove}
      onReject={handleReject}
      onLike={handleLike}
      uploadQRUrl={uploadQRUrl}
    />
  );
}
