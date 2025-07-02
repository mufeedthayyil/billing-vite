/*
  # Fix infinite recursion in users table RLS policy

  1. Problem
    - The `admins_full_user_access` policy creates infinite recursion by querying the users table within its own policy check
    - This prevents any user-related operations from working

  2. Solution
    - Drop the problematic policy that causes recursion
    - Create a simpler policy structure that doesn't create circular dependencies
    - Use auth.jwt() to check user role from the JWT token instead of querying the users table

  3. Security
    - Maintain the same security level but without recursion
    - Users can still read/update their own profiles
    - Admin access is handled through JWT claims instead of database queries
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "admins_full_user_access" ON users;

-- Create a policy that allows users to read their own profile without recursion
-- This policy is already present but we ensure it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_read_own_profile'
  ) THEN
    CREATE POLICY "users_read_own_profile"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create a policy that allows users to update their own profile without recursion
-- This policy is already present but we ensure it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'users_update_own_profile'
  ) THEN
    CREATE POLICY "users_update_own_profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Create a policy for admin users to manage all users
-- Use a simpler approach that doesn't query the users table
CREATE POLICY "admin_users_full_access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Check if the user has admin role in their JWT token
    -- This avoids querying the users table and prevents recursion
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    -- Fallback: allow if user is accessing their own record
    (auth.uid() = id)
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
    OR
    (auth.uid() = id)
  );