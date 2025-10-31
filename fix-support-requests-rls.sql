-- Fix Support Requests RLS Policies
-- Run this in Supabase SQL Editor to fix the admin access issue

-- Add admin_response column if it doesn't exist
ALTER TABLE support_requests 
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can create support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can view support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can delete support requests" ON support_requests;
DROP POLICY IF EXISTS "Users and admins can view support requests" ON support_requests;

-- Policy 1: Users can insert their own support requests
CREATE POLICY "Users can create support requests"
  ON support_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own OR admins can view all
CREATE POLICY "Users and admins can view support requests"
  ON support_requests
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy 3: Admins can update any support request
CREATE POLICY "Admins can update support requests"
  ON support_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy 4: Admins can delete support requests
CREATE POLICY "Admins can delete support requests"
  ON support_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Verify the admin user has the correct role
-- Run this to check your admin user:
SELECT id, email, first_name, last_name, role 
FROM user_profiles 
WHERE role = 'admin';

-- If your admin user doesn't have the 'admin' role, update it:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
