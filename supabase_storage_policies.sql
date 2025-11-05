-- Supabase Storage Policies Setup
-- Execute this SQL in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query

-- ============================================
-- ORGANIZATIONS BUCKET POLICIES (PUBLIC)
-- ============================================

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload organization files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'organizations');

-- Allow public read access (important for logos)
CREATE POLICY "Allow public read access to organization files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'organizations');

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update organization files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'organizations');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete organization files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'organizations');

-- ============================================
-- PATIENTS BUCKET POLICIES (PRIVATE)
-- ============================================

-- Allow authenticated users to upload patient files
CREATE POLICY "Allow authenticated users to upload patient files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patients');

-- Allow authenticated users to read patient files (NO public access)
CREATE POLICY "Allow authenticated users to read patient files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'patients');

-- Allow authenticated users to update patient files
CREATE POLICY "Allow authenticated users to update patient files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patients');

-- Allow authenticated users to delete patient files
CREATE POLICY "Allow authenticated users to delete patient files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patients');
