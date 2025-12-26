-- Budget Management System
-- Event Budget Tracking, Categories, Expenses, Payment Schedule, Alerts

-- ============================================
-- EVENT BUDGET (Main)
-- ============================================

CREATE TABLE event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,

  -- Budget Overview
  total_budget_inr INTEGER NOT NULL,
  allocated_budget_inr INTEGER DEFAULT 0,
  spent_budget_inr INTEGER DEFAULT 0,
  remaining_budget_inr INTEGER GENERATED ALWAYS AS (total_budget_inr - spent_budget_inr) STORED,

  -- Budget Status
  budget_status TEXT CHECK (budget_status IN ('under_budget', 'on_track', 'at_risk', 'over_budget'))
    GENERATED ALWAYS AS (
      CASE
        WHEN spent_budget_inr < total_budget_inr * 0.75 THEN 'under_budget'
        WHEN spent_budget_inr < total_budget_inr * 0.95 THEN 'on_track'
        WHEN spent_budget_inr < total_budget_inr THEN 'at_risk'
        ELSE 'over_budget'
      END
    ) STORED,

  variance_percentage INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN total_budget_inr > 0 THEN ((spent_budget_inr - total_budget_inr)::FLOAT / total_budget_inr * 100)::INTEGER
      ELSE 0
    END
  ) STORED,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUDGET CATEGORIES
-- ============================================

CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,

  -- Category Info
  category_name TEXT NOT NULL,
  category_type TEXT CHECK (category_type IN (
    'venue', 'catering', 'decorations', 'photography', 'videography',
    'entertainment', 'flowers', 'transportation', 'accommodation',
    'invitations', 'gifts', 'rentals', 'staff', 'marketing',
    'equipment', 'miscellaneous'
  )) NOT NULL,

  -- Budget Allocation
  allocated_amount_inr INTEGER NOT NULL,
  spent_amount_inr INTEGER DEFAULT 0,
  remaining_amount_inr INTEGER GENERATED ALWAYS AS (allocated_amount_inr - spent_amount_inr) STORED,

  -- Status
  category_status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN spent_amount_inr > allocated_amount_inr THEN 'over_budget'
      WHEN spent_amount_inr >= allocated_amount_inr * 0.9 THEN 'near_limit'
      ELSE 'on_track'
    END
  ) STORED,

  -- Linked Vendors
  assigned_vendor_ids UUID[], -- Array of vendor IDs for this category

  -- Notes
  notes TEXT,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUDGET EXPENSES
-- ============================================

CREATE TABLE budget_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),

  -- Expense Details
  expense_name TEXT NOT NULL,
  expense_description TEXT,
  amount_inr INTEGER NOT NULL,

  -- Vendor Association
  vendor_id UUID REFERENCES vendors(id),
  vendor_booking_id UUID REFERENCES vendor_bookings(id),

  -- Payment Details
  payment_status TEXT CHECK (payment_status IN ('pending', 'scheduled', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'upi', 'card', 'cheque', 'other')),
  due_date DATE,
  paid_date DATE,
  paid_amount_inr INTEGER DEFAULT 0,

  -- Documentation
  invoice_number TEXT,
  invoice_url TEXT,
  receipt_url TEXT,

  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Notes
  notes TEXT,
  tags TEXT[],

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT SCHEDULE
-- ============================================

CREATE TABLE payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES budget_expenses(id),

  -- Schedule Details
  payment_name TEXT NOT NULL,
  scheduled_amount_inr INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('advance', 'milestone', 'final', 'full', 'other')) DEFAULT 'full',

  -- Vendor Details
  vendor_id UUID REFERENCES vendors(id),
  vendor_booking_id UUID REFERENCES vendor_bookings(id),

  -- Status
  payment_status TEXT CHECK (payment_status IN ('scheduled', 'paid', 'overdue', 'cancelled')) DEFAULT 'scheduled',
  paid_date DATE,
  paid_amount_inr INTEGER,
  payment_method TEXT,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  reminder_days_before INTEGER DEFAULT 7,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUDGET ALERTS
-- ============================================

CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES event_budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),

  -- Alert Configuration
  alert_type TEXT CHECK (alert_type IN (
    'category_exceeded', 'category_near_limit', 'total_exceeded',
    'total_near_limit', 'payment_due', 'payment_overdue'
  )) NOT NULL,

  alert_threshold_percentage INTEGER DEFAULT 90, -- Trigger at 90% of budget

  -- Alert Details
  alert_message TEXT,
  alert_severity TEXT CHECK (alert_severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',

  -- Notification Settings
  is_active BOOLEAN DEFAULT TRUE,
  notify_users UUID[], -- Array of user IDs to notify

  -- Tracking
  last_triggered_at TIMESTAMPTZ,
  times_triggered INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VENDOR PAYMENT TRACKING
-- ============================================

CREATE TABLE vendor_payment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  booking_id UUID REFERENCES vendor_bookings(id),

  -- Payment Summary
  total_contract_amount_inr INTEGER NOT NULL,
  advance_amount_inr INTEGER DEFAULT 0,
  paid_amount_inr INTEGER DEFAULT 0,
  pending_amount_inr INTEGER GENERATED ALWAYS AS (total_contract_amount_inr - paid_amount_inr) STORED,

  -- Payment Status
  payment_status TEXT CHECK (payment_status IN ('not_started', 'partial', 'completed', 'overdue'))
    GENERATED ALWAYS AS (
      CASE
        WHEN paid_amount_inr = 0 THEN 'not_started'
        WHEN paid_amount_inr >= total_contract_amount_inr THEN 'completed'
        WHEN paid_amount_inr > 0 THEN 'partial'
        ELSE 'not_started'
      END
    ) STORED,

  -- Next Payment
  next_payment_date DATE,
  next_payment_amount_inr INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_budget_categories_budget ON budget_categories(budget_id);
CREATE INDEX idx_budget_categories_type ON budget_categories(category_type);
CREATE INDEX idx_budget_expenses_budget ON budget_expenses(budget_id);
CREATE INDEX idx_budget_expenses_category ON budget_expenses(category_id);
CREATE INDEX idx_budget_expenses_vendor ON budget_expenses(vendor_id);
CREATE INDEX idx_budget_expenses_status ON budget_expenses(payment_status);
CREATE INDEX idx_budget_expenses_due_date ON budget_expenses(due_date);
CREATE INDEX idx_payment_schedules_budget ON payment_schedules(budget_id);
CREATE INDEX idx_payment_schedules_date ON payment_schedules(scheduled_date);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(payment_status);
CREATE INDEX idx_budget_alerts_budget ON budget_alerts(budget_id);
CREATE INDEX idx_vendor_payment_tracking_event ON vendor_payment_tracking(event_id);
CREATE INDEX idx_vendor_payment_tracking_vendor ON vendor_payment_tracking(vendor_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payment_tracking ENABLE ROW LEVEL SECURITY;

-- Policies: Event organizers can manage their budget data
CREATE POLICY "Event organizers can manage budgets"
  ON event_budgets FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage budget categories"
  ON budget_categories FOR ALL
  TO authenticated
  USING (
    budget_id IN (
      SELECT b.id FROM event_budgets b
      JOIN events e ON b.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage expenses"
  ON budget_expenses FOR ALL
  TO authenticated
  USING (
    budget_id IN (
      SELECT b.id FROM event_budgets b
      JOIN events e ON b.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage payment schedules"
  ON payment_schedules FOR ALL
  TO authenticated
  USING (
    budget_id IN (
      SELECT b.id FROM event_budgets b
      JOIN events e ON b.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can manage budget alerts"
  ON budget_alerts FOR ALL
  TO authenticated
  USING (
    budget_id IN (
      SELECT b.id FROM event_budgets b
      JOIN events e ON b.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can view vendor payment tracking"
  ON vendor_payment_tracking FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to auto-update spent amounts
CREATE OR REPLACE FUNCTION update_budget_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category spent amount
  IF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL THEN
      UPDATE budget_categories
      SET spent_amount_inr = (
        SELECT COALESCE(SUM(amount_inr), 0)
        FROM budget_expenses
        WHERE category_id = OLD.category_id AND payment_status = 'paid'
      )
      WHERE id = OLD.category_id;
    END IF;

    -- Update total budget spent
    UPDATE event_budgets
    SET spent_budget_inr = (
      SELECT COALESCE(SUM(amount_inr), 0)
      FROM budget_expenses
      WHERE budget_id = OLD.budget_id AND payment_status = 'paid'
    ),
    allocated_budget_inr = (
      SELECT COALESCE(SUM(allocated_amount_inr), 0)
      FROM budget_categories
      WHERE budget_id = OLD.budget_id
    )
    WHERE id = OLD.budget_id;

    RETURN OLD;
  ELSE
    IF NEW.category_id IS NOT NULL THEN
      UPDATE budget_categories
      SET spent_amount_inr = (
        SELECT COALESCE(SUM(amount_inr), 0)
        FROM budget_expenses
        WHERE category_id = NEW.category_id AND payment_status = 'paid'
      )
      WHERE id = NEW.category_id;
    END IF;

    -- Update total budget spent
    UPDATE event_budgets
    SET spent_budget_inr = (
      SELECT COALESCE(SUM(amount_inr), 0)
      FROM budget_expenses
      WHERE budget_id = NEW.budget_id AND payment_status = 'paid'
    ),
    allocated_budget_inr = (
      SELECT COALESCE(SUM(allocated_amount_inr), 0)
      FROM budget_categories
      WHERE budget_id = NEW.budget_id
    )
    WHERE id = NEW.budget_id;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budget_on_expense_change
  AFTER INSERT OR UPDATE OR DELETE ON budget_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_amounts();

-- Function to update budget allocated when categories change
CREATE OR REPLACE FUNCTION update_budget_allocated()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE event_budgets
    SET allocated_budget_inr = (
      SELECT COALESCE(SUM(allocated_amount_inr), 0)
      FROM budget_categories
      WHERE budget_id = OLD.budget_id
    )
    WHERE id = OLD.budget_id;
    RETURN OLD;
  ELSE
    UPDATE event_budgets
    SET allocated_budget_inr = (
      SELECT COALESCE(SUM(allocated_amount_inr), 0)
      FROM budget_categories
      WHERE budget_id = NEW.budget_id
    )
    WHERE id = NEW.budget_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budget_on_category_change
  AFTER INSERT OR UPDATE OR DELETE ON budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_allocated();

-- Function to check and trigger budget alerts
CREATE OR REPLACE FUNCTION check_budget_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  category_record RECORD;
BEGIN
  -- Check total budget alerts
  FOR alert_record IN
    SELECT * FROM budget_alerts
    WHERE budget_id = NEW.id
    AND is_active = TRUE
    AND alert_type IN ('total_exceeded', 'total_near_limit')
  LOOP
    IF alert_record.alert_type = 'total_near_limit' AND
       NEW.spent_budget_inr >= (NEW.total_budget_inr * alert_record.alert_threshold_percentage / 100) THEN
      UPDATE budget_alerts
      SET last_triggered_at = NOW(), times_triggered = times_triggered + 1
      WHERE id = alert_record.id;
    ELSIF alert_record.alert_type = 'total_exceeded' AND
          NEW.spent_budget_inr > NEW.total_budget_inr THEN
      UPDATE budget_alerts
      SET last_triggered_at = NOW(), times_triggered = times_triggered + 1
      WHERE id = alert_record.id;
    END IF;
  END LOOP;

  -- Check category budget alerts
  FOR category_record IN
    SELECT c.*, a.* FROM budget_categories c
    JOIN budget_alerts a ON a.category_id = c.id
    WHERE c.budget_id = NEW.id AND a.is_active = TRUE
  LOOP
    IF category_record.spent_amount_inr >= (category_record.allocated_amount_inr * category_record.alert_threshold_percentage / 100) THEN
      UPDATE budget_alerts
      SET last_triggered_at = NOW(), times_triggered = times_triggered + 1
      WHERE id = category_record.id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_budget_alerts
  AFTER UPDATE ON event_budgets
  FOR EACH ROW
  WHEN (NEW.spent_budget_inr <> OLD.spent_budget_inr)
  EXECUTE FUNCTION check_budget_alerts();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE event_budgets IS 'Main event budget tracking with auto-calculated status';
COMMENT ON TABLE budget_categories IS 'Category-wise budget allocation and tracking';
COMMENT ON TABLE budget_expenses IS 'Individual expense items with payment tracking and approval';
COMMENT ON TABLE payment_schedules IS 'Scheduled payments with reminders';
COMMENT ON TABLE budget_alerts IS 'Automated budget alerts and notifications';
COMMENT ON TABLE vendor_payment_tracking IS 'Per-vendor payment tracking and status';
