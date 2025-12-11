-- Accommodation System for Events
-- This handles hotels, rooms, and guest assignments

-- Accommodations table (hotels/venues for guests)
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'hotel', 'resort', 'apartment', etc.
  address TEXT,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  check_in_date DATE,
  check_out_date DATE,
  total_rooms INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table (individual rooms in accommodations)
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(100), -- 'single', 'double', 'suite', etc.
  capacity INTEGER DEFAULT 1,
  price_per_night DECIMAL(10, 2),
  amenities TEXT[], -- Array of amenities
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(accommodation_id, room_number)
);

-- Room assignments (which guests are in which rooms)
CREATE TABLE room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  check_in_date DATE,
  check_out_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id) -- A guest can only be assigned to one room
);

-- Indexes for better query performance
CREATE INDEX idx_accommodations_event ON accommodations(event_id);
CREATE INDEX idx_rooms_accommodation ON rooms(accommodation_id);
CREATE INDEX idx_room_assignments_room ON room_assignments(room_id);
CREATE INDEX idx_room_assignments_guest ON room_assignments(guest_id);

-- Updated at triggers
CREATE TRIGGER update_accommodations_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_assignments_updated_at
  BEFORE UPDATE ON room_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
