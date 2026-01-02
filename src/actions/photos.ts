'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface Photo {
  id: string;
  event_id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  category: 'pre_wedding' | 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'candid' | 'group' | 'couple' | 'family' | 'guests' | 'decor' | 'food' | 'other';
  uploaded_by: 'host' | 'photographer' | 'guest';
  uploader_id?: string;
  uploader_name?: string;
  is_featured: boolean;
  is_approved: boolean;
  likes_count: number;
  created_at: string;
}

export interface PhotoAlbum {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  cover_photo_id?: string;
  photo_count: number;
  is_public: boolean;
  created_at: string;
}

/**
 * Get all photos for an event
 */
export async function getEventPhotos(eventId: string, category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return data || [];
}

/**
 * Get featured photos for an event
 */
export async function getFeaturedPhotos(eventId: string, limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_featured', true)
    .eq('is_approved', true)
    .order('likes_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }

  return data || [];
}

/**
 * Get photo statistics for an event
 */
export async function getPhotoStats(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_photos')
    .select('category, uploaded_by, is_approved')
    .eq('event_id', eventId);

  if (error) {
    console.error('Error fetching photo stats:', error);
    return {
      total: 0,
      approved: 0,
      pending: 0,
      byCategory: {},
      byUploader: {},
    };
  }

  const photos = data || [];
  const stats = {
    total: photos.length,
    approved: photos.filter(p => p.is_approved).length,
    pending: photos.filter(p => !p.is_approved).length,
    byCategory: {} as Record<string, number>,
    byUploader: {} as Record<string, number>,
  };

  photos.forEach(p => {
    stats.byCategory[p.category] = (stats.byCategory[p.category] || 0) + 1;
    stats.byUploader[p.uploaded_by] = (stats.byUploader[p.uploaded_by] || 0) + 1;
  });

  return stats;
}

/**
 * Upload a photo (by host or photographer)
 */
export async function uploadPhoto(
  eventId: string,
  photoData: {
    url: string;
    thumbnail_url?: string;
    caption?: string;
    category: Photo['category'];
    is_featured?: boolean;
  }
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('event_photos')
    .insert({
      event_id: eventId,
      url: photoData.url,
      thumbnail_url: photoData.thumbnail_url,
      caption: photoData.caption,
      category: photoData.category,
      uploaded_by: 'host',
      uploader_id: user.id,
      is_featured: photoData.is_featured || false,
      is_approved: true, // Auto-approve host uploads
    });

  if (error) {
    console.error('Error uploading photo:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/photos`);
  return { success: true };
}

/**
 * Guest photo upload (requires approval)
 */
export async function uploadGuestPhoto(
  eventId: string,
  guestToken: string,
  photoData: {
    url: string;
    thumbnail_url?: string;
    caption?: string;
    category: Photo['category'];
    uploader_name: string;
  }
) {
  const supabase = await createClient();

  // Verify guest token
  const { data: invitation } = await supabase
    .from('invitations')
    .select('guest_id, guest:guests(name)')
    .eq('token', guestToken)
    .eq('event_id', eventId)
    .single();

  if (!invitation) {
    return { error: 'Invalid guest token' };
  }

  const { error } = await supabase
    .from('event_photos')
    .insert({
      event_id: eventId,
      url: photoData.url,
      thumbnail_url: photoData.thumbnail_url,
      caption: photoData.caption,
      category: photoData.category,
      uploaded_by: 'guest',
      uploader_id: invitation.guest_id,
      uploader_name: photoData.uploader_name || (invitation.guest as any)?.name,
      is_featured: false,
      is_approved: false, // Guest uploads need approval
    });

  if (error) {
    console.error('Error uploading guest photo:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/photos`);
  return { success: true };
}

/**
 * Approve or reject a guest photo
 */
export async function moderatePhoto(photoId: string, approved: boolean) {
  const supabase = await createClient();

  if (approved) {
    const { error } = await supabase
      .from('event_photos')
      .update({ is_approved: true })
      .eq('id', photoId);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Delete rejected photos
    const { error } = await supabase
      .from('event_photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/events`);
  return { success: true };
}

/**
 * Toggle photo featured status
 */
export async function togglePhotoFeatured(photoId: string) {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from('event_photos')
    .select('is_featured')
    .eq('id', photoId)
    .single();

  if (!photo) {
    return { error: 'Photo not found' };
  }

  const { error } = await supabase
    .from('event_photos')
    .update({ is_featured: !photo.is_featured })
    .eq('id', photoId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events`);
  return { success: true, is_featured: !photo.is_featured };
}

/**
 * Like a photo
 */
export async function likePhoto(photoId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_photo_likes', { photo_id: photoId });

  if (error) {
    // Fallback to manual update
    const { data: photo } = await supabase
      .from('event_photos')
      .select('likes_count')
      .eq('id', photoId)
      .single();

    if (photo) {
      await supabase
        .from('event_photos')
        .update({ likes_count: (photo.likes_count || 0) + 1 })
        .eq('id', photoId);
    }
  }

  return { success: true };
}

/**
 * Delete a photo
 */
export async function deletePhoto(photoId: string) {
  const supabase = await createClient();

  const { data: photo } = await supabase
    .from('event_photos')
    .select('event_id')
    .eq('id', photoId)
    .single();

  const { error } = await supabase
    .from('event_photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    return { error: error.message };
  }

  if (photo) {
    revalidatePath(`/events/${photo.event_id}/photos`);
  }
  return { success: true };
}

/**
 * Get albums for an event
 */
export async function getEventAlbums(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('photo_albums')
    .select(`
      *,
      cover_photo:event_photos(url, thumbnail_url)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    return [];
  }

  return data || [];
}

/**
 * Create an album
 */
export async function createAlbum(
  eventId: string,
  albumData: {
    name: string;
    description?: string;
    is_public?: boolean;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('photo_albums')
    .insert({
      event_id: eventId,
      name: albumData.name,
      description: albumData.description,
      is_public: albumData.is_public ?? true,
      photo_count: 0,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/photos`);
  return { success: true };
}

/**
 * Generate QR code data for guest photo uploads
 */
export async function generatePhotoUploadQR(eventId: string, baseUrl: string) {
  // This returns the URL that guests can use to upload photos
  // The actual QR generation happens on the client
  return `${baseUrl}/photos/upload/${eventId}`;
}

/**
 * Get pending photos for moderation
 */
export async function getPendingPhotos(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('event_photos')
    .select('*')
    .eq('event_id', eventId)
    .eq('is_approved', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending photos:', error);
    return [];
  }

  return data || [];
}
