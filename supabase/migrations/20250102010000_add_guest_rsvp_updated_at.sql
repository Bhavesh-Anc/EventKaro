-- Add the rsvp_updated_at column that the app writes when an RSVP changes
-- (src/actions/guests.ts updateRSVP / bulkUpdateFamilyRSVP). Without this column
-- those updates fail with "column does not exist".

ALTER TABLE guests ADD COLUMN IF NOT EXISTS rsvp_updated_at TIMESTAMPTZ;
