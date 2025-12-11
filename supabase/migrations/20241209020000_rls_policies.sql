-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_responses ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization members policies
CREATE POLICY "Users can view organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create memberships"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Events policies
CREATE POLICY "Users can view events in their organizations"
  ON events FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their organizations"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events in their organizations"
  ON events FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Guests policies
CREATE POLICY "Users can view guests for their events"
  ON guests FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage guests for their events"
  ON guests FOR INSERT
  TO authenticated
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update guests for their events"
  ON guests FOR UPDATE
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete guests for their events"
  ON guests FOR DELETE
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Guest groups policies
CREATE POLICY "Users can view guest groups"
  ON guest_groups FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage guest groups"
  ON guest_groups FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Guest dietary preferences policies
CREATE POLICY "Users can view dietary preferences"
  ON guest_dietary_preferences FOR SELECT
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN events e ON g.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage dietary preferences"
  ON guest_dietary_preferences FOR ALL
  TO authenticated
  USING (
    guest_id IN (
      SELECT g.id FROM guests g
      JOIN events e ON g.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Accommodations policies
CREATE POLICY "Users can view accommodations"
  ON accommodations FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage accommodations"
  ON accommodations FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Rooms policies
CREATE POLICY "Users can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    accommodation_id IN (
      SELECT a.id FROM accommodations a
      JOIN events e ON a.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    accommodation_id IN (
      SELECT a.id FROM accommodations a
      JOIN events e ON a.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Room assignments policies
CREATE POLICY "Users can view room assignments"
  ON room_assignments FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT r.id FROM rooms r
      JOIN accommodations a ON r.accommodation_id = a.id
      JOIN events e ON a.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage room assignments"
  ON room_assignments FOR ALL
  TO authenticated
  USING (
    room_id IN (
      SELECT r.id FROM rooms r
      JOIN accommodations a ON r.accommodation_id = a.id
      JOIN events e ON a.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Vendor profiles policies
CREATE POLICY "Anyone can view vendor profiles"
  ON vendor_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their vendor profile"
  ON vendor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their vendor profile"
  ON vendor_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Vendor services policies
CREATE POLICY "Anyone can view vendor services"
  ON vendor_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can manage their services"
  ON vendor_services FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

-- Vendor packages policies
CREATE POLICY "Anyone can view vendor packages"
  ON vendor_packages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vendors can manage their packages"
  ON vendor_packages FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

-- Vendor reviews policies
CREATE POLICY "Anyone can view vendor reviews"
  ON vendor_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON vendor_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their reviews"
  ON vendor_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Quote requests policies
CREATE POLICY "Users can view their quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quote requests"
  ON quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Quote responses policies
CREATE POLICY "Users can view quote responses"
  ON quote_responses FOR SELECT
  TO authenticated
  USING (
    quote_request_id IN (
      SELECT id FROM quote_requests
      WHERE user_id = auth.uid() OR
      vendor_id IN (
        SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Vendors can create quote responses"
  ON quote_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    quote_request_id IN (
      SELECT qr.id FROM quote_requests qr
      JOIN vendor_profiles vp ON qr.vendor_id = vp.id
      WHERE vp.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their quote responses"
  ON quote_responses FOR UPDATE
  TO authenticated
  USING (
    quote_request_id IN (
      SELECT qr.id FROM quote_requests qr
      JOIN vendor_profiles vp ON qr.vendor_id = vp.id
      WHERE vp.user_id = auth.uid()
    )
  );
