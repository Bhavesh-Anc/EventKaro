-- Vendor Marketplace Schema

-- Vendor Profiles
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Business Information
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN (
    'caterer',
    'photographer',
    'videographer',
    'decorator',
    'venue',
    'dj',
    'makeup_artist',
    'mehendi_artist',
    'florist',
    'cake_designer',
    'wedding_planner',
    'sound_lighting',
    'entertainment',
    'transport',
    'other'
  )),
  tagline TEXT,
  description TEXT,

  -- Contact Information
  contact_person TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  website TEXT,

  -- Location
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  service_areas TEXT[], -- Array of cities/regions they serve

  -- Business Details
  years_in_business INTEGER,
  team_size INTEGER,
  license_number TEXT,
  gst_number TEXT,

  -- Pricing
  starting_price_inr INTEGER, -- Starting price in paise
  price_range TEXT CHECK (price_range IN ('budget', 'moderate', 'premium', 'luxury')),

  -- Portfolio
  logo_url TEXT,
  cover_image_url TEXT,
  portfolio_images TEXT[], -- Array of image URLs
  video_url TEXT,

  -- Social Media
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,

  -- Statistics
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Availability
  available_from DATE,
  available_to DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_business_type ON vendors(business_type);
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_active ON vendors(is_active);
CREATE INDEX idx_vendors_verified ON vendors(is_verified);
CREATE INDEX idx_vendors_rating ON vendors(average_rating DESC);

-- Vendor Services/Offerings
CREATE TABLE vendor_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  service_name TEXT NOT NULL,
  description TEXT,
  price_inr INTEGER, -- Price in paise
  price_type TEXT CHECK (price_type IN ('per_person', 'per_day', 'per_event', 'per_hour', 'fixed')),
  is_featured BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_services_vendor ON vendor_services(vendor_id);

-- Vendor Pricing Packages
CREATE TABLE vendor_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  package_name TEXT NOT NULL,
  description TEXT,
  price_inr INTEGER NOT NULL, -- Price in paise
  features TEXT[], -- Array of features included
  max_guests INTEGER,
  duration_hours INTEGER,
  is_popular BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_packages_vendor ON vendor_packages(vendor_id);

-- Quote Requests
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Request Details
  service_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER,
  venue_location TEXT,
  budget_range TEXT,

  -- Message
  message TEXT,
  additional_requirements JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'viewed',
    'quoted',
    'accepted',
    'rejected',
    'expired'
  )),

  -- Response
  vendor_response TEXT,
  quoted_price_inr INTEGER, -- Price in paise
  response_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_event ON quote_requests(event_id);
CREATE INDEX idx_quote_requests_vendor ON quote_requests(vendor_id);
CREATE INDEX idx_quote_requests_requester ON quote_requests(requester_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- Vendor Bookings
CREATE TABLE vendor_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  quote_request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Booking Details
  service_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  service_start_time TIME,
  service_end_time TIME,

  -- Pricing
  total_amount_inr INTEGER NOT NULL, -- Total in paise
  advance_paid_inr INTEGER DEFAULT 0,
  balance_amount_inr INTEGER,

  -- Payment Milestones
  payment_terms JSONB DEFAULT '{}', -- {milestone: amount}

  -- Contract
  contract_url TEXT,
  terms_conditions TEXT,
  special_requirements TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled'
  )),

  -- Cancellation
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  cancellation_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_bookings_event ON vendor_bookings(event_id);
CREATE INDEX idx_vendor_bookings_vendor ON vendor_bookings(vendor_id);
CREATE INDEX idx_vendor_bookings_organizer ON vendor_bookings(organizer_id);
CREATE INDEX idx_vendor_bookings_status ON vendor_bookings(status);

-- Vendor Reviews
CREATE TABLE vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES vendor_bookings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),

  -- Review Content
  review_title TEXT,
  review_text TEXT,
  pros TEXT,
  cons TEXT,

  -- Media
  review_images TEXT[], -- Array of image URLs

  -- Metadata
  would_recommend BOOLEAN,
  is_verified_booking BOOLEAN DEFAULT FALSE,

  -- Vendor Response
  vendor_response TEXT,
  vendor_response_date TIMESTAMPTZ,

  -- Moderation
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_reviewer ON vendor_reviews(reviewer_id);
CREATE INDEX idx_vendor_reviews_rating ON vendor_reviews(overall_rating DESC);
CREATE INDEX idx_vendor_reviews_approved ON vendor_reviews(is_approved);

-- Vendor Saved/Favorites
CREATE TABLE vendor_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

CREATE INDEX idx_vendor_favorites_user ON vendor_favorites(user_id);
CREATE INDEX idx_vendor_favorites_vendor ON vendor_favorites(vendor_id);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Vendors: Public can view active vendors, owners can manage their own
CREATE POLICY "Anyone can view active vendors"
  ON vendors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Vendors can manage their own profile"
  ON vendors FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Vendor Services: Public can view, vendors can manage their own
CREATE POLICY "Anyone can view vendor services"
  ON vendor_services FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE is_active = true)
  );

CREATE POLICY "Vendors can manage their services"
  ON vendor_services FOR ALL
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

-- Vendor Packages: Public can view, vendors can manage their own
CREATE POLICY "Anyone can view vendor packages"
  ON vendor_packages FOR SELECT
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE is_active = true)
  );

CREATE POLICY "Vendors can manage their packages"
  ON vendor_packages FOR ALL
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

-- Quote Requests: Requesters and vendors can view their own
CREATE POLICY "Users can view their quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    requester_id = (SELECT auth.uid()) OR
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can create quote requests"
  ON quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = (SELECT auth.uid()));

CREATE POLICY "Users and vendors can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (
    requester_id = (SELECT auth.uid()) OR
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

-- Vendor Bookings: Organizers and vendors can view their bookings
CREATE POLICY "Users can view their bookings"
  ON vendor_bookings FOR SELECT
  TO authenticated
  USING (
    organizer_id = (SELECT auth.uid()) OR
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can create bookings"
  ON vendor_bookings FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = (SELECT auth.uid()));

CREATE POLICY "Users and vendors can update bookings"
  ON vendor_bookings FOR UPDATE
  TO authenticated
  USING (
    organizer_id = (SELECT auth.uid()) OR
    vendor_id IN (SELECT id FROM vendors WHERE user_id = (SELECT auth.uid()))
  );

-- Vendor Reviews: Public can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
  ON vendor_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create reviews for their bookings"
  ON vendor_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = (SELECT auth.uid()));

CREATE POLICY "Reviewers can update their reviews"
  ON vendor_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (SELECT auth.uid()));

-- Vendor Favorites: Users can manage their favorites
CREATE POLICY "Users can manage their favorites"
  ON vendor_favorites FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vendor_services_updated_at BEFORE UPDATE ON vendor_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vendor_packages_updated_at BEFORE UPDATE ON vendor_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vendor_bookings_updated_at BEFORE UPDATE ON vendor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update vendor statistics when reviews are added
CREATE OR REPLACE FUNCTION update_vendor_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vendors
    SET
      total_reviews = total_reviews + 1,
      average_rating = (
        SELECT AVG(overall_rating)::DECIMAL(3,2)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id AND is_approved = true
      )
    WHERE id = NEW.vendor_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_approved != NEW.is_approved THEN
    UPDATE vendors
    SET
      total_reviews = (
        SELECT COUNT(*)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id AND is_approved = true
      ),
      average_rating = (
        SELECT AVG(overall_rating)::DECIMAL(3,2)
        FROM vendor_reviews
        WHERE vendor_id = NEW.vendor_id AND is_approved = true
      )
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_stats_on_review
  AFTER INSERT OR UPDATE ON vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_review_stats();

-- Function to update vendor booking statistics
CREATE OR REPLACE FUNCTION update_vendor_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE vendors
    SET total_bookings = total_bookings + 1
    WHERE id = NEW.vendor_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
    UPDATE vendors
    SET completed_bookings = completed_bookings + 1
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_stats_on_booking
  AFTER INSERT OR UPDATE ON vendor_bookings
  FOR EACH ROW EXECUTE FUNCTION update_vendor_booking_stats();
