-- Add wedding onboarding fields to events table
-- These fields help with intelligent suggestions and personalization

-- Add wedding-specific columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS wedding_style TEXT CHECK (wedding_style IN ('traditional', 'modern', 'destination', 'intimate', 'royal', 'eco_friendly'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS budget_range TEXT CHECK (budget_range IN ('budget', 'moderate', 'premium', 'luxury', 'ultra_luxury'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS guest_count_estimate TEXT CHECK (guest_count_estimate IN ('intimate', 'small', 'medium', 'large', 'grand'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS wedding_functions JSONB DEFAULT '[]'; -- Array of selected functions
ALTER TABLE events ADD COLUMN IF NOT EXISTS bride_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS groom_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS primary_contact_phone TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_budget_inr DECIMAL(15,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS bride_family_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS groom_family_name TEXT;

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_events_wedding_style ON events(wedding_style) WHERE event_type = 'wedding';
CREATE INDEX IF NOT EXISTS idx_events_budget_range ON events(budget_range) WHERE event_type = 'wedding';

-- Comment on columns for documentation
COMMENT ON COLUMN events.wedding_style IS 'Style of wedding: traditional, modern, destination, intimate, royal, eco_friendly';
COMMENT ON COLUMN events.budget_range IS 'Budget tier: budget (<10L), moderate (10-25L), premium (25-50L), luxury (50L-1Cr), ultra_luxury (>1Cr)';
COMMENT ON COLUMN events.guest_count_estimate IS 'Guest count tier: intimate (<50), small (50-150), medium (150-300), large (300-500), grand (500+)';
COMMENT ON COLUMN events.wedding_functions IS 'JSON array of selected wedding functions like engagement, mehendi, haldi, sangeet, wedding, reception';
