-- Payment Installment Tracking System
-- Track vendor payments in multiple installments with due dates and reminders

-- Create payment installments table
CREATE TABLE IF NOT EXISTS vendor_payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_booking_id UUID REFERENCES vendor_bookings(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,

  -- Installment details
  installment_number INTEGER NOT NULL DEFAULT 1,
  installment_name TEXT, -- e.g., "Advance", "Before Event", "Final Payment"

  -- Amount details (in INR)
  amount_inr DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2), -- Percentage of total contract value

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'due', 'overdue', 'paid', 'partially_paid', 'cancelled')),
  due_date DATE NOT NULL,
  paid_date DATE,
  paid_amount_inr DECIMAL(15,2) DEFAULT 0,

  -- Payment details
  payment_method TEXT, -- e.g., "bank_transfer", "upi", "cash", "cheque"
  payment_reference TEXT, -- Transaction ID, cheque number, etc.
  receipt_url TEXT, -- Link to receipt/invoice

  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(vendor_booking_id, installment_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_installments_event ON vendor_payment_installments(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_vendor ON vendor_payment_installments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_status ON vendor_payment_installments(status);
CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date ON vendor_payment_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_installments_booking ON vendor_payment_installments(vendor_booking_id);

-- Enable RLS
ALTER TABLE vendor_payment_installments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view payment installments for their events"
  ON vendor_payment_installments FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can manage payment installments for their events"
  ON vendor_payment_installments FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

-- Update trigger
CREATE TRIGGER vendor_payment_installments_updated_at
  BEFORE UPDATE ON vendor_payment_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add contributor tracking to budgets
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS contributor_name TEXT;
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS contributor_side TEXT CHECK (contributor_side IN ('bride', 'groom', 'shared'));
ALTER TABLE wedding_event_budgets ADD COLUMN IF NOT EXISTS contribution_notes TEXT;

-- Create budget contributions table for shared expenses
CREATE TABLE IF NOT EXISTS budget_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES wedding_event_budgets(id) ON DELETE SET NULL,

  -- Contributor details
  contributor_name TEXT NOT NULL,
  contributor_side TEXT CHECK (contributor_side IN ('bride', 'groom', 'other')),
  contributor_relation TEXT, -- e.g., "Father of Bride", "Uncle"

  -- Contribution details
  amount_inr DECIMAL(15,2) NOT NULL,
  contribution_type TEXT DEFAULT 'monetary' CHECK (contribution_type IN ('monetary', 'in_kind', 'service')),
  category TEXT, -- Budget category this applies to

  -- Tracking
  status TEXT DEFAULT 'pledged' CHECK (status IN ('pledged', 'received', 'pending')),
  received_date DATE,
  payment_method TEXT,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for contributions
CREATE INDEX IF NOT EXISTS idx_budget_contributions_event ON budget_contributions(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_contributions_side ON budget_contributions(contributor_side);
CREATE INDEX IF NOT EXISTS idx_budget_contributions_status ON budget_contributions(status);

-- Enable RLS for contributions
ALTER TABLE budget_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget contributions for their events"
  ON budget_contributions FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can manage budget contributions for their events"
  ON budget_contributions FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

-- Create view for payment summary
CREATE OR REPLACE VIEW vendor_payment_summary AS
SELECT
  vpi.event_id,
  vpi.vendor_id,
  v.business_name as vendor_name,
  COUNT(vpi.id) as total_installments,
  SUM(vpi.amount_inr) as total_amount,
  SUM(vpi.paid_amount_inr) as total_paid,
  SUM(vpi.amount_inr) - SUM(vpi.paid_amount_inr) as total_pending,
  COUNT(CASE WHEN vpi.status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN vpi.status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN vpi.status = 'overdue' THEN 1 END) as overdue_count,
  MIN(CASE WHEN vpi.status IN ('pending', 'due') THEN vpi.due_date END) as next_due_date
FROM vendor_payment_installments vpi
LEFT JOIN vendors v ON vpi.vendor_id = v.id
GROUP BY vpi.event_id, vpi.vendor_id, v.business_name;

-- Create view for contribution summary by side
CREATE OR REPLACE VIEW contribution_summary AS
SELECT
  event_id,
  contributor_side,
  COUNT(id) as contribution_count,
  SUM(amount_inr) as total_pledged,
  SUM(CASE WHEN status = 'received' THEN amount_inr ELSE 0 END) as total_received,
  SUM(CASE WHEN status = 'pending' THEN amount_inr ELSE 0 END) as total_pending
FROM budget_contributions
GROUP BY event_id, contributor_side;

-- Comments
COMMENT ON TABLE vendor_payment_installments IS 'Tracks payment installments for vendor bookings - advance, before event, final, etc.';
COMMENT ON TABLE budget_contributions IS 'Tracks financial contributions from both families for wedding expenses';
COMMENT ON COLUMN vendor_payment_installments.status IS 'Payment status: pending (not yet due), due (due date reached), overdue (past due date), paid, partially_paid, cancelled';
