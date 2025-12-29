-- Vendor Contracts & Deliverables Management
-- Track scope of work, deliverables checklist, payment milestones, cancellation terms
-- Build vendor reliability score (private, data-driven)

-- ============================================
-- VENDOR CONTRACTS
-- ============================================

CREATE TABLE vendor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,

  -- Contract basics
  contract_number TEXT UNIQUE,
  contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signed_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'active', 'completed', 'cancelled', 'disputed')),

  -- Scope of work
  service_category TEXT NOT NULL, -- photography, catering, decoration, etc.
  scope_of_work TEXT NOT NULL,
  detailed_requirements JSONB DEFAULT '{}',

  -- Events covered (for wedding sub-events)
  wedding_events_covered UUID[], -- Array of wedding_events.id

  -- Financial terms
  total_amount_inr INTEGER NOT NULL,
  advance_percentage INTEGER DEFAULT 30,
  advance_amount_inr INTEGER,
  balance_amount_inr INTEGER,

  -- Payment schedule
  payment_terms TEXT, -- "30% advance, 40% before event, 30% on delivery"
  payment_due_dates JSONB DEFAULT '[]', -- Array of {amount, due_date, description}

  -- Deliverables timeline
  delivery_date DATE,
  delivery_timeline_days INTEGER,

  -- Cancellation terms
  cancellation_policy TEXT,
  cancellation_charges_percentage INTEGER,
  non_refundable_amount_inr INTEGER,

  -- Terms & conditions
  terms_and_conditions TEXT,
  contract_document_url TEXT, -- PDF/doc upload

  -- Penalties & bonuses
  late_delivery_penalty_per_day_inr INTEGER,
  early_delivery_bonus_inr INTEGER,

  -- Notes
  special_conditions TEXT,
  internal_notes TEXT, -- private notes not shared with vendor

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_contracts_event ON vendor_contracts(event_id);
CREATE INDEX idx_vendor_contracts_vendor ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_contracts_status ON vendor_contracts(status);

-- ============================================
-- CONTRACT DELIVERABLES CHECKLIST
-- ============================================

CREATE TABLE contract_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES vendor_contracts(id) ON DELETE CASCADE,

  -- Deliverable details
  deliverable_name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'pre_event', 'during_event', 'post_event'

  -- For photography/videography: specific shots/videos
  -- For decoration: specific items/setups
  -- For catering: menu items, quantities
  deliverable_details JSONB DEFAULT '{}',

  -- Timeline
  due_date DATE,
  delivered_date DATE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'approved', 'rejected', 'delayed')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

  -- Quality check
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  quality_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Delay tracking
  is_delayed BOOLEAN GENERATED ALWAYS AS (delivered_date IS NOT NULL AND delivered_date > due_date) STORED,
  delay_days INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN delivered_date IS NOT NULL AND due_date IS NOT NULL
      THEN delivered_date - due_date
      ELSE NULL
    END
  ) STORED,

  -- Files/evidence
  delivery_proof_urls TEXT[], -- photos, documents, videos

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deliverables_contract ON contract_deliverables(contract_id);
CREATE INDEX idx_deliverables_status ON contract_deliverables(status);
CREATE INDEX idx_deliverables_due_date ON contract_deliverables(due_date);

-- ============================================
-- PAYMENT MILESTONES
-- ============================================

CREATE TABLE contract_payment_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES vendor_contracts(id) ON DELETE CASCADE,

  -- Milestone details
  milestone_name TEXT NOT NULL, -- 'Advance', 'Pre-event payment', 'Final payment'
  milestone_sequence INTEGER NOT NULL,

  -- Amount
  amount_inr INTEGER NOT NULL CHECK (amount_inr > 0),
  amount_percentage INTEGER CHECK (amount_percentage >= 0 AND amount_percentage <= 100),

  -- Due date (can be triggered by event or deliverable)
  due_date DATE,
  trigger_condition TEXT, -- 'on_signing', '7_days_before_event', 'on_delivery', etc.

  -- Payment tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'due', 'paid', 'overdue', 'waived')),
  paid_date DATE,
  paid_amount_inr INTEGER,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other')),
  payment_reference TEXT, -- transaction ID, cheque number, etc.

  -- Overdue tracking
  is_overdue BOOLEAN GENERATED ALWAYS AS (
    status = 'pending' AND due_date IS NOT NULL AND due_date < CURRENT_DATE
  ) STORED,
  days_overdue INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN status = 'pending' AND due_date IS NOT NULL AND due_date < CURRENT_DATE
      THEN CURRENT_DATE - due_date
      ELSE 0
    END
  ) STORED,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_milestones_contract ON contract_payment_milestones(contract_id);
CREATE INDEX idx_payment_milestones_status ON contract_payment_milestones(status);
CREATE INDEX idx_payment_milestones_due_date ON contract_payment_milestones(due_date);

-- ============================================
-- VENDOR PERFORMANCE TRACKING
-- ============================================

CREATE TABLE vendor_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES vendor_contracts(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Performance metrics
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'on_time_arrival',
    'scope_adherence',
    'quality_delivery',
    'professionalism',
    'responsiveness',
    'cancellation',
    'dispute',
    'late_delivery',
    'incomplete_delivery'
  )),

  -- Scoring (1-5 or boolean)
  score INTEGER CHECK (score >= 1 AND score <= 5),
  is_positive BOOLEAN, -- for yes/no metrics

  -- Context
  description TEXT,
  evidence_urls TEXT[], -- photos, screenshots, documents

  -- Date
  log_date TIMESTAMPTZ DEFAULT NOW(),
  event_date DATE,

  -- Impact severity (for negative metrics)
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Resolution (if applicable)
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,

  -- Logged by
  logged_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_performance_vendor ON vendor_performance_logs(vendor_id);
CREATE INDEX idx_vendor_performance_contract ON vendor_performance_logs(contract_id);
CREATE INDEX idx_vendor_performance_metric ON vendor_performance_logs(metric_type);

-- ============================================
-- VENDOR RELIABILITY SCORE (Calculated View)
-- ============================================

CREATE OR REPLACE VIEW vendor_reliability_scores AS
SELECT
  vp.id as vendor_id,
  vp.business_name,

  -- Total events serviced
  COUNT(DISTINCT vc.event_id) as total_events,

  -- Performance metrics
  AVG(CASE WHEN vpl.metric_type = 'on_time_arrival' AND vpl.is_positive = TRUE THEN 1 ELSE 0 END) * 100 as on_time_percentage,
  AVG(CASE WHEN vpl.metric_type = 'scope_adherence' THEN vpl.score ELSE NULL END) as avg_scope_adherence_score,
  AVG(CASE WHEN vpl.metric_type = 'quality_delivery' THEN vpl.score ELSE NULL END) as avg_quality_score,
  AVG(CASE WHEN vpl.metric_type = 'professionalism' THEN vpl.score ELSE NULL END) as avg_professionalism_score,

  -- Negative incidents
  COUNT(*) FILTER (WHERE vpl.metric_type = 'cancellation') as cancellation_count,
  COUNT(*) FILTER (WHERE vpl.metric_type = 'dispute') as dispute_count,
  COUNT(*) FILTER (WHERE vpl.metric_type = 'late_delivery') as late_delivery_count,

  -- Deliverables tracking
  COUNT(cd.id) as total_deliverables,
  COUNT(*) FILTER (WHERE cd.status = 'delivered' OR cd.status = 'approved') as completed_deliverables,
  COUNT(*) FILTER (WHERE cd.is_delayed = TRUE) as delayed_deliverables,
  ROUND(AVG(cd.quality_rating), 2) as avg_deliverable_quality,

  -- Payment reliability (from vendor's perspective - how well organizers pay)
  COUNT(cpm.id) FILTER (WHERE cpm.status = 'paid') as payments_received,
  COUNT(cpm.id) FILTER (WHERE cpm.status = 'overdue') as payments_overdue,

  -- Overall reliability score (0-100)
  ROUND(
    (
      (AVG(CASE WHEN vpl.metric_type = 'on_time_arrival' AND vpl.is_positive = TRUE THEN 1 ELSE 0 END) * 20) + -- 20 points for on-time
      (COALESCE(AVG(CASE WHEN vpl.metric_type = 'scope_adherence' THEN vpl.score ELSE NULL END), 3) * 10) + -- 50 points for scope
      (COALESCE(AVG(CASE WHEN vpl.metric_type = 'quality_delivery' THEN vpl.score ELSE NULL END), 3) * 6) + -- 30 points for quality
      (GREATEST(0, 100 - (COUNT(*) FILTER (WHERE vpl.metric_type IN ('cancellation', 'dispute')) * 25))) / 10 -- -25 points per incident
    ), 2
  ) as reliability_score,

  -- Last event date
  MAX(e.start_date) as last_event_date,

  -- Recommendation status
  CASE
    WHEN COUNT(DISTINCT vc.event_id) < 2 THEN 'insufficient_data'
    WHEN AVG(CASE WHEN vpl.metric_type = 'quality_delivery' THEN vpl.score ELSE 3 END) >= 4.5
         AND COUNT(*) FILTER (WHERE vpl.metric_type IN ('cancellation', 'dispute')) = 0
         THEN 'highly_recommended'
    WHEN AVG(CASE WHEN vpl.metric_type = 'quality_delivery' THEN vpl.score ELSE 3 END) >= 3.5
         AND COUNT(*) FILTER (WHERE vpl.metric_type IN ('cancellation', 'dispute')) <= 1
         THEN 'recommended'
    WHEN COUNT(*) FILTER (WHERE vpl.metric_type IN ('cancellation', 'dispute')) > 2
         OR AVG(CASE WHEN vpl.metric_type = 'quality_delivery' THEN vpl.score ELSE 3 END) < 2.5
         THEN 'not_recommended'
    ELSE 'neutral'
  END as recommendation_status

FROM vendor_profiles vp
LEFT JOIN vendor_contracts vc ON vp.id = vc.vendor_id
LEFT JOIN vendor_performance_logs vpl ON vp.id = vpl.vendor_id
LEFT JOIN contract_deliverables cd ON vc.id = cd.contract_id
LEFT JOIN contract_payment_milestones cpm ON vc.id = cpm.contract_id
LEFT JOIN events e ON vc.event_id = e.id
GROUP BY vp.id, vp.business_name;

-- ============================================
-- CONTRACT COMPLETION SUMMARY VIEW
-- ============================================

CREATE OR REPLACE VIEW contract_completion_summary AS
SELECT
  vc.id as contract_id,
  vc.contract_number,
  vc.event_id,
  vc.vendor_id,
  vc.status,

  -- Deliverables completion
  COUNT(cd.id) as total_deliverables,
  COUNT(*) FILTER (WHERE cd.status IN ('delivered', 'approved')) as completed_deliverables,
  COUNT(*) FILTER (WHERE cd.status = 'delayed') as delayed_deliverables,
  COUNT(*) FILTER (WHERE cd.status = 'pending') as pending_deliverables,
  ROUND((COUNT(*) FILTER (WHERE cd.status IN ('delivered', 'approved'))::DECIMAL / NULLIF(COUNT(cd.id), 0) * 100), 2) as completion_percentage,

  -- Payment status
  COUNT(cpm.id) as total_payment_milestones,
  COUNT(*) FILTER (WHERE cpm.status = 'paid') as paid_milestones,
  COUNT(*) FILTER (WHERE cpm.status = 'overdue') as overdue_milestones,
  SUM(CASE WHEN cpm.status = 'paid' THEN cpm.paid_amount_inr ELSE 0 END) as total_paid,
  SUM(CASE WHEN cpm.status != 'paid' THEN cpm.amount_inr ELSE 0 END) as total_pending,
  ROUND((SUM(CASE WHEN cpm.status = 'paid' THEN cpm.paid_amount_inr ELSE 0 END)::DECIMAL / NULLIF(vc.total_amount_inr, 0) * 100), 2) as payment_completion_percentage,

  -- Overall health
  CASE
    WHEN COUNT(*) FILTER (WHERE cd.status = 'delayed') > 0 OR COUNT(*) FILTER (WHERE cpm.status = 'overdue') > 0 THEN 'at_risk'
    WHEN COUNT(*) FILTER (WHERE cd.status IN ('delivered', 'approved')) = COUNT(cd.id) AND COUNT(*) FILTER (WHERE cpm.status = 'paid') = COUNT(cpm.id) THEN 'completed'
    WHEN COUNT(*) FILTER (WHERE cd.status = 'pending') > 0 OR COUNT(*) FILTER (WHERE cpm.status = 'pending') > 0 THEN 'in_progress'
    ELSE 'unknown'
  END as contract_health

FROM vendor_contracts vc
LEFT JOIN contract_deliverables cd ON vc.id = cd.contract_id
LEFT JOIN contract_payment_milestones cpm ON vc.id = cpm.contract_id
GROUP BY vc.id;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_logs ENABLE ROW LEVEL SECURITY;

-- Organizers can manage their contracts
CREATE POLICY "Org members can manage contracts"
  ON vendor_contracts FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- Vendors can view their contracts (read-only)
CREATE POLICY "Vendors can view their contracts"
  ON vendor_contracts FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT id FROM vendor_profiles WHERE user_id = auth.uid()
    )
  );

-- Deliverables policies
CREATE POLICY "Org members can manage deliverables"
  ON contract_deliverables FOR ALL
  TO authenticated
  USING (
    contract_id IN (
      SELECT vc.id FROM vendor_contracts vc
      JOIN events e ON vc.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view their deliverables"
  ON contract_deliverables FOR SELECT
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM vendor_contracts
      WHERE vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid())
    )
  );

-- Payment milestones policies
CREATE POLICY "Org members can manage payments"
  ON contract_payment_milestones FOR ALL
  TO authenticated
  USING (
    contract_id IN (
      SELECT vc.id FROM vendor_contracts vc
      JOIN events e ON vc.event_id = e.id
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view their payments"
  ON contract_payment_milestones FOR SELECT
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM vendor_contracts
      WHERE vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid())
    )
  );

-- Performance logs (private to organizers only)
CREATE POLICY "Org members can manage performance logs"
  ON vendor_performance_logs FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN organization_members om ON e.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER vendor_contracts_updated_at BEFORE UPDATE ON vendor_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contract_deliverables_updated_at BEFORE UPDATE ON contract_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contract_payments_updated_at BEFORE UPDATE ON contract_payment_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE vendor_contracts IS 'Vendor contracts with scope of work, financials, and terms';
COMMENT ON TABLE contract_deliverables IS 'Deliverables checklist with status and quality tracking';
COMMENT ON TABLE contract_payment_milestones IS 'Payment milestones and tracking for vendor contracts';
COMMENT ON TABLE vendor_performance_logs IS 'Private performance tracking for building vendor reliability scores';
COMMENT ON VIEW vendor_reliability_scores IS 'Calculated reliability scores based on historical performance data';
COMMENT ON VIEW contract_completion_summary IS 'Contract health dashboard showing deliverables and payment status';
