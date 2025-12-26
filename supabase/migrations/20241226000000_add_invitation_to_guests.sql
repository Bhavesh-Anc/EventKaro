-- Add invitation fields to existing guests table
-- This migration extends the guests table with invitation functionality

ALTER TABLE guests
ADD COLUMN IF NOT EXISTS invitation_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_url TEXT,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ;

-- Create function to generate invitation token (if not exists)
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');
    SELECT EXISTS(SELECT 1 FROM guests WHERE invitation_token = token) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invitation tokens for new guests
CREATE OR REPLACE FUNCTION auto_generate_invitation_token_for_guests()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := generate_invitation_token();
    NEW.invitation_expires_at := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_generate_invitation_token_guests ON guests;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_invitation_token_guests
  BEFORE INSERT ON guests
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_invitation_token_for_guests();

-- Add index on invitation_token
CREATE INDEX IF NOT EXISTS idx_guests_invitation_token ON guests(invitation_token);

-- Update RLS policies to allow public access via invitation token
DROP POLICY IF EXISTS "Anyone can view guest by invitation token" ON guests;
CREATE POLICY "Anyone can view guest by invitation token"
  ON guests FOR SELECT
  TO anon, authenticated
  USING (invitation_token IS NOT NULL AND invitation_expires_at > NOW());

DROP POLICY IF EXISTS "Anyone can update guest via invitation token" ON guests;
CREATE POLICY "Anyone can update guest via invitation token"
  ON guests FOR UPDATE
  TO anon, authenticated
  USING (invitation_token IS NOT NULL AND invitation_expires_at > NOW());

-- Update existing guests to have invitation tokens
UPDATE guests
SET
  invitation_token = generate_invitation_token(),
  invitation_expires_at = NOW() + INTERVAL '30 days'
WHERE invitation_token IS NULL;

COMMENT ON COLUMN guests.invitation_token IS 'Unique token for guest self-registration URL';
COMMENT ON COLUMN guests.invitation_expires_at IS 'Expiration date for invitation link (30 days from creation)';
