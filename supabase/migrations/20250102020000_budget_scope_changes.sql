-- Track budget scope changes for audit trail
-- Records when and why budget allocations changed

CREATE TABLE IF NOT EXISTS budget_scope_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('guest_increase', 'vendor_change', 'scope_expansion', 'price_increase', 'other')),
  affected_categories TEXT[] NOT NULL DEFAULT '{}',
  old_budget_inr BIGINT NOT NULL,
  new_budget_inr BIGINT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_scope_changes_event ON budget_scope_changes(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_budget_scope_changes_date ON budget_scope_changes(changed_at DESC);

ALTER TABLE budget_scope_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_scope_changes_access" ON budget_scope_changes FOR ALL TO authenticated
  USING (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    parent_event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );
