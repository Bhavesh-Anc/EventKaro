-- Wedding settings
-- Stores per-wedding configuration (total budget + cost assumptions) that was
-- previously hardcoded in the app / stored in localStorage.
-- All monetary values are stored in RUPEES (not paise) to match the budget
-- settings UI and the guest cost-calculation helpers.

CREATE TABLE IF NOT EXISTS wedding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  total_budget_inr BIGINT NOT NULL DEFAULT 4200000,      -- ₹42L
  catering_per_head_inr INTEGER NOT NULL DEFAULT 1500,   -- ₹1500 / head
  room_per_night_inr INTEGER NOT NULL DEFAULT 4000,      -- ₹4000 / room / night
  transport_per_seat_inr INTEGER NOT NULL DEFAULT 500,   -- ₹500 / seat
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_settings_event ON wedding_settings(event_id);

ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wedding_settings_access" ON wedding_settings;
CREATE POLICY "wedding_settings_access" ON wedding_settings FOR ALL TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Keep updated_at fresh on changes (reuse existing helper if present)
DROP TRIGGER IF EXISTS wedding_settings_updated_at ON wedding_settings;
CREATE TRIGGER wedding_settings_updated_at
  BEFORE UPDATE ON wedding_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
