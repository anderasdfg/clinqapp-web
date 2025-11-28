-- Add updated_at defaults to all tables
-- This fixes the "null value in column updated_at" error

-- Add default CURRENT_TIMESTAMP to organizations table
ALTER TABLE "public"."organizations" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to users table
ALTER TABLE "public"."users" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to schedules table
ALTER TABLE "public"."schedules" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to patients table
ALTER TABLE "public"."patients" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to services table
ALTER TABLE "public"."services" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to appointments table
ALTER TABLE "public"."appointments" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to treatments table
ALTER TABLE "public"."treatments" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to payments table
ALTER TABLE "public"."payments" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to coupons table
ALTER TABLE "public"."coupons" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- Add default CURRENT_TIMESTAMP to invitations table (if exists)
ALTER TABLE "public"."invitations" 
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
