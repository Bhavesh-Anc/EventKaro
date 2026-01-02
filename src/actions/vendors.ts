'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Vendor CRUD Operations

export async function createVendorProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const businessName = formData.get('business_name') as string;
  const businessType = formData.get('business_type') as string;
  const phone = formData.get('phone') as string;
  const city = formData.get('city') as string;
  const description = formData.get('description') as string || null;
  const tagline = formData.get('tagline') as string || null;
  const address = formData.get('address') as string || null;
  const state = formData.get('state') as string || null;
  const pincode = formData.get('pincode') as string || null;
  const gstNumber = formData.get('gst_number') as string || null;

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      user_id: user.id,
      business_name: businessName,
      business_type: businessType,
      phone,
      city,
      description,
      tagline,
      address,
      state,
      pincode,
      gst_number: gstNumber,
      email: user.email,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vendor profile:', error);
  }

  revalidatePath('/vendors');
  redirect(data ? `/vendors/${data.id}` : '/vendors');
}

export async function getVendorByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function getVendor(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select(`
      *,
      vendor_services(*),
      vendor_packages(*),
      vendor_reviews(
        *,
        reviewer:profiles(full_name)
      )
    `)
    .eq('id', vendorId)
    .single();

  if (error) return null;
  return data;
}

export async function searchVendors(filters: {
  businessType?: string;
  city?: string;
  priceRange?: string;
  searchQuery?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('average_rating', { ascending: false });

  if (filters.businessType) {
    query = query.eq('business_type', filters.businessType);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.priceRange) {
    query = query.eq('price_range', filters.priceRange);
  }

  if (filters.searchQuery) {
    query = query.ilike('business_name', `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) return [];
  return data;
}

export async function getAllVendors() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('average_rating', { ascending: false });

  if (error) return [];
  return data;
}

export async function updateVendorProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const vendorId = formData.get('vendor_id') as string;
  const businessName = formData.get('business_name') as string;
  const description = formData.get('description') as string || null;
  const tagline = formData.get('tagline') as string || null;
  const phone = formData.get('phone') as string;
  const whatsappNumber = formData.get('whatsapp_number') as string || null;
  const website = formData.get('website') as string || null;
  const address = formData.get('address') as string || null;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string || null;
  const pincode = formData.get('pincode') as string || null;
  const yearsInBusiness = formData.get('years_in_business') ? parseInt(formData.get('years_in_business') as string) : null;
  const teamSize = formData.get('team_size') ? parseInt(formData.get('team_size') as string) : null;
  const gstNumber = formData.get('gst_number') as string || null;
  const priceRange = formData.get('price_range') as string || null;

  const { error } = await supabase
    .from('vendors')
    .update({
      business_name: businessName,
      description,
      tagline,
      phone,
      whatsapp_number: whatsappNumber,
      website,
      address,
      city,
      state,
      pincode,
      years_in_business: yearsInBusiness,
      team_size: teamSize,
      gst_number: gstNumber,
      price_range: priceRange,
    })
    .eq('id', vendorId)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  return { success: true };
}

// Quote Request Operations

export async function createQuoteRequest(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const eventId = formData.get('event_id') as string;
  const vendorId = formData.get('vendor_id') as string;
  const serviceType = formData.get('service_type') as string;
  const eventDate = formData.get('event_date') as string;
  const guestCount = formData.get('guest_count') ? parseInt(formData.get('guest_count') as string) : null;
  const venueLocation = formData.get('venue_location') as string || null;
  const budgetRange = formData.get('budget_range') as string || null;
  const message = formData.get('message') as string || null;

  const { error } = await supabase
    .from('quote_requests')
    .insert({
      event_id: eventId,
      vendor_id: vendorId,
      requester_id: user.id,
      service_type: serviceType,
      event_date: eventDate,
      guest_count: guestCount,
      venue_location: venueLocation,
      budget_range: budgetRange,
      message,
    });

  if (error) {
    console.error('Error creating quote request:', error);
  }

  revalidatePath(`/events/${eventId}/vendors`);
  redirect(`/events/${eventId}/vendors`);
}

export async function getEventQuoteRequests(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      vendor:vendors(
        id,
        business_name,
        business_type,
        logo_url,
        city,
        average_rating
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function getVendorQuoteRequests(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      event:events(
        id,
        title,
        start_date,
        venue_name
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false});

  if (error) return [];
  return data;
}

export async function getQuoteRequest(quoteRequestId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      event:events(
        id,
        title,
        start_date,
        end_date,
        venue_name,
        venue_location
      ),
      requester:profiles(
        full_name,
        email,
        phone
      )
    `)
    .eq('id', quoteRequestId)
    .single();

  if (error) return null;
  return data;
}

export async function respondToQuoteRequest(formData: FormData) {
  const supabase = await createClient();

  const quoteRequestId = formData.get('quote_request_id') as string;
  const vendorResponse = formData.get('vendor_response') as string;
  const quotedPrice = formData.get('quoted_price') ? parseFloat(formData.get('quoted_price') as string) * 100 : null; // Convert to paise

  const { error } = await supabase
    .from('quote_requests')
    .update({
      status: 'quoted',
      vendor_response: vendorResponse,
      quoted_price_inr: quotedPrice,
      response_date: new Date().toISOString(),
    })
    .eq('id', quoteRequestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/vendor/quotes');
  return { success: true };
}

// Review Operations

export async function createVendorReview(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const vendorId = formData.get('vendor_id') as string;
  const bookingId = formData.get('booking_id') as string || null;
  const eventId = formData.get('event_id') as string || null;
  const overallRating = parseInt(formData.get('overall_rating') as string);
  const qualityRating = parseInt(formData.get('quality_rating') as string);
  const professionalismRating = parseInt(formData.get('professionalism_rating') as string);
  const valueRating = parseInt(formData.get('value_rating') as string);
  const communicationRating = parseInt(formData.get('communication_rating') as string);
  const reviewTitle = formData.get('review_title') as string || null;
  const reviewText = formData.get('review_text') as string || null;
  const wouldRecommend = formData.get('would_recommend') === 'true';

  const { error } = await supabase
    .from('vendor_reviews')
    .insert({
      vendor_id: vendorId,
      booking_id: bookingId,
      event_id: eventId,
      reviewer_id: user.id,
      overall_rating: overallRating,
      quality_rating: qualityRating,
      professionalism_rating: professionalismRating,
      value_rating: valueRating,
      communication_rating: communicationRating,
      review_title: reviewTitle,
      review_text: reviewText,
      would_recommend: wouldRecommend,
    });

  if (error) {
    console.error('Error creating vendor review:', error);
  }

  revalidatePath(`/vendors/${vendorId}`);
  redirect(`/vendors/${vendorId}`);
}

export async function getVendorReviews(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_reviews')
    .select(`
      *,
      reviewer:profiles(full_name, avatar_url)
    `)
    .eq('vendor_id', vendorId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

// Favorite Operations

export async function toggleVendorFavorite(vendorId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('vendor_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId)
    .single();

  if (existing) {
    // Remove from favorites
    const { error } = await supabase
      .from('vendor_favorites')
      .delete()
      .eq('id', existing.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/vendors/${vendorId}`);
    return { favorited: false };
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('vendor_favorites')
      .insert({
        user_id: user.id,
        vendor_id: vendorId,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/vendors/${vendorId}`);
    return { favorited: true };
  }
}

export async function getUserFavoriteVendors() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('vendor_favorites')
    .select(`
      *,
      vendor:vendors(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map((fav: any) => fav.vendor);
}

export async function isVendorFavorited(vendorId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from('vendor_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId)
    .single();

  return !!data;
}

// Service Operations

export async function getVendorServices(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function createVendorService(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const vendorId = formData.get('vendor_id') as string;
  const serviceName = formData.get('service_name') as string;
  const description = formData.get('description') as string || null;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) * 100 : null;
  const unit = formData.get('unit') as string || null;

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('vendor_services')
    .insert({
      vendor_id: vendorId,
      service_name: serviceName,
      description,
      price_inr: price,
      unit,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/services');
  return { data, success: true };
}

export async function updateVendorService(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const serviceId = formData.get('service_id') as string;
  const vendorId = formData.get('vendor_id') as string;
  const serviceName = formData.get('service_name') as string;
  const description = formData.get('description') as string || null;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) * 100 : null;
  const unit = formData.get('unit') as string || null;

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('vendor_services')
    .update({
      service_name: serviceName,
      description,
      price_inr: price,
      unit,
    })
    .eq('id', serviceId)
    .eq('vendor_id', vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/services');
  return { success: true };
}

export async function deleteVendorService(serviceId: string, vendorId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('vendor_services')
    .delete()
    .eq('id', serviceId)
    .eq('vendor_id', vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/services');
  return { success: true };
}

// Package Operations

export async function getVendorPackages(vendorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_packages')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function createVendorPackage(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const vendorId = formData.get('vendor_id') as string;
  const packageName = formData.get('package_name') as string;
  const description = formData.get('description') as string || null;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) * 100 : null;
  const features = formData.get('features') as string;
  const minGuests = formData.get('min_guests') ? parseInt(formData.get('min_guests') as string) : null;
  const maxGuests = formData.get('max_guests') ? parseInt(formData.get('max_guests') as string) : null;
  const isPopular = formData.get('is_popular') === 'true';

  // Parse features as JSON array
  let featuresArray: string[] = [];
  try {
    featuresArray = features.split('\n').filter(f => f.trim().length > 0);
  } catch (e) {
    return { error: 'Invalid features format' };
  }

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('vendor_packages')
    .insert({
      vendor_id: vendorId,
      package_name: packageName,
      description,
      price_inr: price,
      features: featuresArray,
      min_guests: minGuests,
      max_guests: maxGuests,
      is_popular: isPopular,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/packages');
  return { data, success: true };
}

export async function updateVendorPackage(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const packageId = formData.get('package_id') as string;
  const vendorId = formData.get('vendor_id') as string;
  const packageName = formData.get('package_name') as string;
  const description = formData.get('description') as string || null;
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) * 100 : null;
  const features = formData.get('features') as string;
  const minGuests = formData.get('min_guests') ? parseInt(formData.get('min_guests') as string) : null;
  const maxGuests = formData.get('max_guests') ? parseInt(formData.get('max_guests') as string) : null;
  const isPopular = formData.get('is_popular') === 'true';

  // Parse features as JSON array
  let featuresArray: string[] = [];
  try {
    featuresArray = features.split('\n').filter(f => f.trim().length > 0);
  } catch (e) {
    return { error: 'Invalid features format' };
  }

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('vendor_packages')
    .update({
      package_name: packageName,
      description,
      price_inr: price,
      features: featuresArray,
      min_guests: minGuests,
      max_guests: maxGuests,
      is_popular: isPopular,
    })
    .eq('id', packageId)
    .eq('vendor_id', vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/packages');
  return { success: true };
}

export async function deleteVendorPackage(packageId: string, vendorId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify vendor ownership
  const vendor = await getVendorByUserId(user.id);
  if (!vendor || vendor.id !== vendorId) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('vendor_packages')
    .delete()
    .eq('id', packageId)
    .eq('vendor_id', vendorId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  revalidatePath('/vendor/packages');
  return { success: true };
}

// Service Detail Operations (for detail pages)

/**
 * Get full service details with vendor info and related services
 */
export async function getServiceDetails(serviceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_services')
    .select(`
      *,
      vendors (
        id,
        business_name,
        business_type,
        logo_url,
        city,
        state,
        average_rating,
        total_reviews,
        phone,
        email,
        website,
        whatsapp_number
      )
    `)
    .eq('id', serviceId)
    .single();

  if (error) {
    console.error('Error fetching service details:', error);
    return null;
  }

  return data;
}

/**
 * Get related services from the same vendor
 */
export async function getRelatedServices(vendorId: string, serviceId: string, limit: number = 4) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_available', true)
    .neq('id', serviceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related services:', error);
    return [];
  }

  return data;
}

// Package Detail Operations (for detail pages)

/**
 * Get full package details with vendor info and related packages
 */
export async function getPackageDetails(packageId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_packages')
    .select(`
      *,
      vendors (
        id,
        business_name,
        business_type,
        logo_url,
        city,
        state,
        average_rating,
        total_reviews,
        phone,
        email,
        website,
        whatsapp_number
      )
    `)
    .eq('id', packageId)
    .single();

  if (error) {
    console.error('Error fetching package details:', error);
    return null;
  }

  return data;
}

/**
 * Get related packages from the same vendor
 */
export async function getRelatedPackages(vendorId: string, packageId: string, limit: number = 4) {
  const supabase = await createClient();

  const { data, error} = await supabase
    .from('vendor_packages')
    .select('*')
    .eq('vendor_id', vendorId)
    .neq('id', packageId)
    .order('is_popular', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related packages:', error);
    return [];
  }

  return data;
}

// Service Category Operations

/**
 * Get all active service categories
 */
export async function getServiceCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching service categories:', error);
    return [];
  }

  return data;
}

/**
 * Get sub-categories for a parent category
 */
export async function getSubCategories(parentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .eq('parent_id', parentId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching sub-categories:', error);
    return [];
  }

  return data;
}

/**
 * Get vendors by category
 */
export async function getVendorsByCategory(categorySlug: string) {
  const supabase = await createClient();

  // First get the category
  const { data: category } = await supabase
    .from('service_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return [];
  }

  // Get vendors in this category
  const { data, error } = await supabase
    .from('vendor_categories')
    .select(`
      vendor:vendors(*)
    `)
    .eq('category_id', category.id);

  if (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
  }

  return data.map((vc: any) => vc.vendor).filter(Boolean);
}

/**
 * Assign categories to vendor
 */
export async function assignVendorCategories(vendorId: string, categoryIds: string[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Verify user owns this vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('user_id')
    .eq('id', vendorId)
    .single();

  if (!vendor || vendor.user_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  // Delete existing categories
  await supabase
    .from('vendor_categories')
    .delete()
    .eq('vendor_id', vendorId);

  // Insert new categories
  const categoryRecords = categoryIds.map((categoryId, index) => ({
    vendor_id: vendorId,
    category_id: categoryId,
    is_primary: index === 0,
  }));

  const { error } = await supabase
    .from('vendor_categories')
    .insert(categoryRecords);

  if (error) {
    console.error('Error assigning vendor categories:', error);
    return { error: error.message };
  }

  revalidatePath(`/vendors/${vendorId}`);
  return { success: true };
}

// ============================================================================
// VENDOR BOOKINGS
// ============================================================================

/**
 * Get all vendor bookings for an event
 */
export async function getEventVendorBookings(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(`
      *,
      vendor:vendors(id, business_name, business_type, city, phone, email),
      quote_request:quote_requests(*)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching event vendor bookings:', error);
    return [];
  }

  return data || [];
}

/**
 * Get pending quote requests for an event
 */
export async function getEventPendingQuotes(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      vendor:vendors(id, business_name, business_type, city, phone, email)
    `)
    .eq('event_id', eventId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching event pending quotes:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a vendor booking
 */
export async function createVendorBooking(bookingData: {
  eventId: string;
  vendorId: string;
  quoteRequestId?: string;
  amount: number;
  bookingDate: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('vendor_bookings')
    .insert({
      event_id: bookingData.eventId,
      vendor_id: bookingData.vendorId,
      quote_request_id: bookingData.quoteRequestId,
      organizer_id: user.id,
      amount_inr: bookingData.amount,
      booking_date: bookingData.bookingDate,
      notes: bookingData.notes,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vendor booking:', error);
    return { error: error.message };
  }

  // Update quote request status if exists
  if (bookingData.quoteRequestId) {
    await supabase
      .from('quote_requests')
      .update({ status: 'accepted' })
      .eq('id', bookingData.quoteRequestId);
  }

  revalidatePath(`/events/${bookingData.eventId}/vendors`);
  return { success: true, booking: data };
}

/**
 * Get vendor booking details
 */
export async function getVendorBooking(bookingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendor_bookings')
    .select(`
      *,
      vendor:vendors(*),
      event:events(*),
      quote_request:quote_requests(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching vendor booking:', error);
    return null;
  }

  return data;
}

/**
 * Update vendor booking status
 */
export async function updateVendorBookingStatus(bookingId: string, status: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('vendor_bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating vendor booking status:', error);
    return { error: error.message };
  }

  revalidatePath(`/events/${data.event_id}/vendors`);
  return { success: true, booking: data };
}

/**
 * Get vendor bookings stats for an event
 */
export async function getEventVendorStats(eventId: string) {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('vendor_bookings')
    .select('amount_inr, status')
    .eq('event_id', eventId);

  const { data: quotes } = await supabase
    .from('quote_requests')
    .select('status')
    .eq('event_id', eventId);

  const totalVendors = bookings?.length || 0;
  const confirmedVendors = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const pendingQuotes = quotes?.filter(q => q.status === 'pending').length || 0;
  const totalCost = bookings?.reduce((sum, b) => sum + (b.amount_inr || 0), 0) || 0;

  return {
    totalVendors,
    confirmedVendors,
    pendingQuotes,
    totalCost,
  };
}

// ============================================================================
// VENDOR PAYMENT TRACKING
// ============================================================================

/**
 * Record a payment for a vendor booking
 */
export async function recordVendorPayment(paymentData: {
  bookingId: string;
  amount: number;
  paymentType: 'advance' | 'partial' | 'final' | 'full';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // First get the booking
  const { data: booking } = await supabase
    .from('vendor_bookings')
    .select('id, event_id, amount_inr, advance_paid_inr')
    .eq('id', paymentData.bookingId)
    .single();

  if (!booking) {
    return { error: 'Booking not found' };
  }

  const currentPaid = booking.advance_paid_inr || 0;
  const newTotal = currentPaid + paymentData.amount;
  const totalAmount = booking.amount_inr || 0;

  // Determine payment status
  let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  if (newTotal >= totalAmount) {
    paymentStatus = 'paid';
  } else if (newTotal > 0) {
    paymentStatus = 'partial';
  }

  // Update the booking with new payment info
  const { error: updateError } = await supabase
    .from('vendor_bookings')
    .update({
      advance_paid_inr: newTotal,
      payment_status: paymentStatus,
    })
    .eq('id', paymentData.bookingId);

  if (updateError) {
    console.error('Error updating booking payment:', updateError);
    return { error: updateError.message };
  }

  // Record the payment in a payments table if it exists
  // For now, we just update the booking record

  revalidatePath(`/events/${booking.event_id}/vendors`);
  return {
    success: true,
    newTotalPaid: newTotal,
    paymentStatus,
    remainingBalance: totalAmount - newTotal,
  };
}

/**
 * Get payment summary for an event's vendors
 */
export async function getEventVendorPaymentSummary(eventId: string) {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from('vendor_bookings')
    .select('amount_inr, advance_paid_inr, payment_status, status')
    .eq('event_id', eventId)
    .eq('status', 'confirmed');

  if (error) {
    console.error('Error fetching payment summary:', error);
    return {
      totalCommitted: 0,
      totalPaid: 0,
      totalPending: 0,
      paidVendors: 0,
      partialVendors: 0,
      unpaidVendors: 0,
    };
  }

  const totalCommitted = bookings?.reduce((sum, b) => sum + (b.amount_inr || 0), 0) || 0;
  const totalPaid = bookings?.reduce((sum, b) => sum + (b.advance_paid_inr || 0), 0) || 0;
  const totalPending = totalCommitted - totalPaid;

  const paidVendors = bookings?.filter(b => b.payment_status === 'paid').length || 0;
  const partialVendors = bookings?.filter(b => b.payment_status === 'partial').length || 0;
  const unpaidVendors = bookings?.filter(b => !b.payment_status || b.payment_status === 'unpaid').length || 0;

  return {
    totalCommitted,
    totalPaid,
    totalPending,
    paidVendors,
    partialVendors,
    unpaidVendors,
  };
}

/**
 * Get all quoted quote requests for an event (quotes received but not yet accepted/rejected)
 */
export async function getEventQuotedRequests(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      vendor:vendors(id, business_name, business_type, city, phone, email)
    `)
    .eq('event_id', eventId)
    .eq('status', 'quoted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quoted requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Accept a vendor quote and create a booking
 */
export async function acceptVendorQuote(quoteId: string, eventId: string) {
  const supabase = await createClient();

  // Get the quote details
  const { data: quote, error: quoteError } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (quoteError || !quote) {
    return { error: 'Quote not found' };
  }

  // Update quote status to accepted
  const { error: updateError } = await supabase
    .from('quote_requests')
    .update({ status: 'accepted' })
    .eq('id', quoteId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Create a vendor booking
  const { error: bookingError } = await supabase
    .from('vendor_bookings')
    .insert({
      vendor_id: quote.vendor_id,
      event_id: eventId,
      quote_request_id: quoteId,
      amount_inr: quote.quoted_price_inr || 0,
      status: 'pending',
      payment_status: 'unpaid',
    });

  if (bookingError) {
    console.error('Error creating booking from quote:', bookingError);
    return { error: bookingError.message };
  }

  revalidatePath(`/events/${eventId}/vendors`);
  return { success: true };
}

/**
 * Reject a vendor quote
 */
export async function rejectVendorQuote(quoteId: string) {
  const supabase = await createClient();

  // Get the quote to find the event ID for revalidation
  const { data: quote } = await supabase
    .from('quote_requests')
    .select('event_id')
    .eq('id', quoteId)
    .single();

  const { error } = await supabase
    .from('quote_requests')
    .update({ status: 'rejected' })
    .eq('id', quoteId);

  if (error) {
    return { error: error.message };
  }

  if (quote?.event_id) {
    revalidatePath(`/events/${quote.event_id}/vendors`);
  }

  return { success: true };
}
