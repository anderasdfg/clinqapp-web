-- Create the migration file to fix the missing trigger
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or replace the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  new_org_uuid UUID; -- Explicit variable for ID
  user_full_name TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  org_name TEXT;
  org_slug TEXT;
BEGIN
  -- Extract name from metadata or default to email parts
  user_full_name := new.raw_user_meta_data->>'full_name';
  IF user_full_name IS NULL OR user_full_name = '' THEN
    user_full_name := split_part(new.email, '@', 1);
  END IF;

  -- Split name for first/last (simple approximation)
  user_first_name := split_part(user_full_name, ' ', 1);
  user_last_name := substring(user_full_name from length(user_first_name) + 2);
  
  IF user_last_name IS NULL OR user_last_name = '' THEN
    user_last_name := 'User';
  END IF;

  -- Generate valid UUID
  new_org_uuid := gen_random_uuid();

  -- Generate Organization Name and Slug
  org_name := user_full_name || '''s Consultorio';
  org_slug := lower(regexp_replace(user_first_name, '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(new_org_uuid::text from 1 for 8);

  -- 1. Create Organization with EXPLICIT ID
  INSERT INTO public.organizations (
    id,
    name,
    slug,
    email,
    is_temporary,
    onboarding_completed,
    notification_email,
    notification_whatsapp,
    send_reminders,
    reminder_hours_before,
    default_appointment_duration,
    appointment_interval,
    allow_online_booking,
    specialty,
    subscription_plan,
    subscription_status,
    updated_at -- Explicitly added
  ) VALUES (
    new_org_uuid, -- USE THE GENERATED UUID
    org_name,
    org_slug,
    new.email,
    true, -- is_temporary
    false, -- onboarding_completed
    true,
    false,
    true,
    24,
    30,
    0,
    false,
    'PODIATRY', -- Default, can be changed in onboarding
    'FREE_TRIAL',
    'TRIALING',
    NOW() -- Explicitly set updated_at
  ) RETURNING id INTO org_id;

  -- 2. Create User linked to Organization
  INSERT INTO public.users (
    id,
    auth_id,
    email,
    first_name,
    last_name,
    organization_id,
    role,
    email_verified,
    updated_at -- Explicitly added
  ) VALUES (
    gen_random_uuid(),
    new.id,
    new.email,
    user_first_name,
    user_last_name,
    org_id,
    'OWNER',
    false,
    NOW() -- Explicitly set updated_at
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger 
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
