-- Create the migration file to sync email verification status
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email_confirmed_at was null and is now NOT null
  IF (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL) THEN
    UPDATE public.users
    SET 
      email_verified = true,
      updated_at = NOW()
    WHERE auth_id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_update();
