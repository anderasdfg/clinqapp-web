-- ============================================
-- Set existing organizations as NOT temporary
-- ============================================
-- Run this once to mark existing organizations as completed onboarding
-- This is for organizations created before the onboarding feature

UPDATE public.organizations
SET is_temporary = false
WHERE is_temporary = true
  AND created_at < NOW();
