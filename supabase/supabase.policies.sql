-- supabase/policies.sql

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get user's organization_id
-- ============================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id 
  FROM users 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT
  FROM users 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = get_user_organization_id());

-- Only OWNER can update organization
CREATE POLICY "Only owner can update organization"
  ON organizations FOR UPDATE
  USING (
    id = get_user_organization_id() 
    AND get_user_role() = 'OWNER'
  );

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view users in their organization
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (organization_id = get_user_organization_id());

-- Only OWNER can insert users (invite team members)
CREATE POLICY "Only owner can add users"
  ON users FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND get_user_role() = 'OWNER'
  );

-- OWNER can update any user, others can update themselves
CREATE POLICY "Users can update themselves or owner can update any"
  ON users FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND (
      auth_id = auth.uid() 
      OR get_user_role() = 'OWNER'
    )
  );

-- Only OWNER can delete users
CREATE POLICY "Only owner can delete users"
  ON users FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() = 'OWNER'
  );

-- ============================================
-- SCHEDULES POLICIES
-- ============================================

CREATE POLICY "Users can view org schedules"
  ON schedules FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "Owner and professionals can manage schedules"
  ON schedules FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- ============================================
-- PATIENTS POLICIES
-- ============================================

CREATE POLICY "Users can view org patients"
  ON patients FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND deleted_at IS NULL
  );

CREATE POLICY "Owner, professionals and receptionists can create patients"
  ON patients FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL', 'RECEPTIONIST')
  );

CREATE POLICY "Owner and professionals can update patients"
  ON patients FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- Soft delete
CREATE POLICY "Owner and professionals can delete patients"
  ON patients FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- ============================================
-- SERVICES POLICIES
-- ============================================

CREATE POLICY "Users can view org services"
  ON services FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND deleted_at IS NULL
  );

CREATE POLICY "Owner and professionals can manage services"
  ON services FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view org appointments"
  ON appointments FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND deleted_at IS NULL
  );

CREATE POLICY "Owner, professionals and receptionists can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL', 'RECEPTIONIST')
  );

CREATE POLICY "Owner, professionals and receptionists can update appointments"
  ON appointments FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL', 'RECEPTIONIST')
  );

-- ============================================
-- TREATMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view org treatments"
  ON treatments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE organization_id = get_user_organization_id()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Professionals can manage treatments"
  ON treatments FOR ALL
  USING (
    patient_id IN (
      SELECT id FROM patients 
      WHERE organization_id = get_user_organization_id()
    )
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- ============================================
-- TREATMENT IMAGES POLICIES
-- ============================================

CREATE POLICY "Users can view treatment images"
  ON treatment_images FOR SELECT
  USING (
    treatment_id IN (
      SELECT t.id FROM treatments t
      JOIN patients p ON t.patient_id = p.id
      WHERE p.organization_id = get_user_organization_id()
    )
  );

CREATE POLICY "Professionals can manage treatment images"
  ON treatment_images FOR ALL
  USING (
    treatment_id IN (
      SELECT t.id FROM treatments t
      JOIN patients p ON t.patient_id = p.id
      WHERE p.organization_id = get_user_organization_id()
    )
    AND get_user_role() IN ('OWNER', 'PROFESSIONAL')
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

CREATE POLICY "Users can view org payments"
  ON payments FOR SELECT
  USING (organization_id = get_user_organization_id());

CREATE POLICY "All roles can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
  );

-- Only owner can update/delete payments
CREATE POLICY "Only owner can modify payments"
  ON payments FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() = 'OWNER'
  );

-- ============================================
-- COUPONS POLICIES
-- ============================================

CREATE POLICY "Users can view active org coupons"
  ON coupons FOR SELECT
  USING (
    organization_id = get_user_organization_id()
    AND is_active = true
  );

CREATE POLICY "Only owner can manage coupons"
  ON coupons FOR ALL
  USING (
    organization_id = get_user_organization_id()
    AND get_user_role() = 'OWNER'
  );