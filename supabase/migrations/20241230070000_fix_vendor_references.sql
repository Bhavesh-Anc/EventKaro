-- Fix vendor table references
-- The original vendor marketplace migration created table as "vendors"
-- But later migrations reference "vendor_profiles"
-- This creates an alias/view to fix the inconsistency

-- Create vendor_profiles as a view aliasing vendors table
-- This allows both names to work
CREATE OR REPLACE VIEW vendor_profiles AS
SELECT
  id,
  user_id,
  business_name,
  business_type AS category, -- alias for compatibility
  business_type,
  tagline,
  description,
  contact_person,
  email AS contact_email,
  email,
  phone AS contact_phone,
  phone,
  whatsapp_number,
  website,
  address,
  city,
  state,
  pincode,
  service_areas,
  years_in_business,
  team_size,
  license_number,
  gst_number,
  starting_price_inr,
  price_range,
  logo_url,
  cover_image_url,
  portfolio_images,
  video_url,
  instagram_url,
  facebook_url,
  youtube_url,
  total_bookings,
  completed_bookings,
  average_rating,
  total_reviews,
  is_verified,
  is_featured,
  is_active,
  available_from,
  available_to,
  created_at,
  updated_at
FROM vendors;

-- Grant permissions on the view
GRANT SELECT ON vendor_profiles TO authenticated;
GRANT SELECT ON vendor_profiles TO anon;
