-- Add RSVP cutoff date to wedding settings for tracking late RSVPs

ALTER TABLE wedding_settings
ADD COLUMN IF NOT EXISTS rsvp_cutoff_date DATE;

COMMENT ON COLUMN wedding_settings.rsvp_cutoff_date IS 'RSVPs received after this date are considered late for catering cost calculations';
