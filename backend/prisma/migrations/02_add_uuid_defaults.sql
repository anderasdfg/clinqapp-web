-- Add UUID generation defaults to all tables
-- This fixes the "null value in column id" error

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add default UUID generation to organizations table
ALTER TABLE "public"."organizations" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to users table
ALTER TABLE "public"."users" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to schedules table
ALTER TABLE "public"."schedules" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to patients table
ALTER TABLE "public"."patients" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to services table
ALTER TABLE "public"."services" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to appointments table
ALTER TABLE "public"."appointments" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to treatments table
ALTER TABLE "public"."treatments" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to treatment_images table
ALTER TABLE "public"."treatment_images" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to payments table
ALTER TABLE "public"."payments" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to coupons table
ALTER TABLE "public"."coupons" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to payment_method_configs table (if exists)
ALTER TABLE "public"."payment_method_configs" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to consultation_type_configs table (if exists)
ALTER TABLE "public"."consultation_type_configs" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- Add default UUID generation to invitations table (if exists)
ALTER TABLE "public"."invitations" 
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
