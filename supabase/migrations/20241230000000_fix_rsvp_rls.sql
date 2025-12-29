-- Fix RLS policies for RSVP submission
-- Problem: Multiple UPDATE policies are causing conflicts for anonymous users

-- Drop ALL existing UPDATE policies on guests table
DROP POLICY IF EXISTS "Users can update guests for their events" ON guests;
DROP POLICY IF EXISTS "Anyone can update guest via invitation token" ON guests;

-- Create a single, comprehensive UPDATE policy that handles both cases
CREATE POLICY "Guests UPDATE policy"
  ON guests FOR UPDATE
  TO anon, authenticated
  USING (
    -- Case 1: Anonymous users with valid invitation token
    (
      auth.role() = 'anon' AND
      invitation_token IS NOT NULL AND
      invitation_expires_at > NOW()
    )
    OR
    -- Case 2: Authenticated users managing their event guests
    (
      auth.role() = 'authenticated' AND
      event_id IN (
        SELECT e.id FROM events e
        JOIN organization_members om ON e.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    -- Same conditions for checking the update
    (
      auth.role() = 'anon' AND
      invitation_token IS NOT NULL AND
      invitation_expires_at > NOW()
    )
    OR
    (
      auth.role() = 'authenticated' AND
      event_id IN (
        SELECT e.id FROM events e
        JOIN organization_members om ON e.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
      )
    )
  );

-- Also update the SELECT policy to ensure it works for anonymous users
DROP POLICY IF EXISTS "Users can view guests for their events" ON guests;
DROP POLICY IF EXISTS "Anyone can view guest by invitation token" ON guests;

CREATE POLICY "Guests SELECT policy"
  ON guests FOR SELECT
  TO anon, authenticated
  USING (
    -- Case 1: Anonymous users with valid invitation token
    (
      auth.role() = 'anon' AND
      invitation_token IS NOT NULL AND
      invitation_expires_at > NOW()
    )
    OR
    -- Case 2: Authenticated users viewing their event guests
    (
      auth.role() = 'authenticated' AND
      event_id IN (
        SELECT e.id FROM events e
        JOIN organization_members om ON e.organization_id = om.organization_id
        WHERE om.user_id = auth.uid()
      )
    )
  );

COMMENT ON POLICY "Guests UPDATE policy" ON guests IS 'Allows both anonymous RSVP via invitation token and authenticated event organizers to update guests';
COMMENT ON POLICY "Guests SELECT policy" ON guests IS 'Allows both anonymous RSVP viewing via invitation token and authenticated event organizers to view guests';
