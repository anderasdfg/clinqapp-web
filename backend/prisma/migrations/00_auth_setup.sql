-- ============================================
-- CLINQAPP - COMPLETE AUTH SETUP
-- ============================================
-- This migration sets up everything needed for authentication
-- Run this after prisma db push

-- ============================================
-- 1. Enable UUID Extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. Set UUID Defaults for All Tables
-- ============================================
ALTER TABLE public.organizations ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.patients ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.services ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.appointments ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.treatments ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.treatment_images ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.payments ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.coupons ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE public.schedules ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ============================================
-- 2.1. Set updated_at Defaults and Triggers
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_treatments_updated_at ON public.treatments;
CREATE TRIGGER update_treatments_updated_at
    BEFORE UPDATE ON public.treatments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set default for updated_at on INSERT (same as created_at)
ALTER TABLE public.organizations ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.patients ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.services ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.appointments ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.treatments ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.payments ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.coupons ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.schedules ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 3. Disable RLS for Development
-- ============================================
-- Note: Enable RLS in production with proper policies
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Grant Permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.organizations TO authenticated, anon;
GRANT ALL ON public.users TO authenticated, anon;
GRANT ALL ON public.patients TO authenticated, anon;
GRANT ALL ON public.services TO authenticated, anon;
GRANT ALL ON public.appointments TO authenticated, anon;
GRANT ALL ON public.treatments TO authenticated, anon;
GRANT ALL ON public.treatment_images TO authenticated, anon;
GRANT ALL ON public.payments TO authenticated, anon;
GRANT ALL ON public.coupons TO authenticated, anon;
GRANT ALL ON public.schedules TO authenticated, anon;

-- ============================================
-- 5. Helper Functions
-- ============================================

-- Get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================
-- NOTES FOR FUTURE (Phase 2 - Onboarding)
-- ============================================
-- When implementing onboarding, uncomment this:
/*
-- Add is_temporary field to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT false;

-- Function to cleanup temporary organizations
CREATE OR REPLACE FUNCTION public.cleanup_temporary_orgs()
RETURNS void AS $$
  UPDATE public.organizations
  SET deleted_at = NOW()
  WHERE is_temporary = true
    AND created_at < NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;
*/

-- ============================================
-- NOTES FOR FUTURE (Phase 3 - Invitations)
-- ============================================
-- Invitations table will be created via Prisma migrations
-- This file just sets up the foundation
