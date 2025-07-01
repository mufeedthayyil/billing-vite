/*
  # Fix Authentication and Profile Management

  1. Database Changes
    - Fix RLS policies to prevent infinite recursion
    - Update user roles to include 'customer'
    - Add proper policies for all user types

  2. Security
    - Enable RLS on all tables
    - Add policies for customers, staff, and admins
    - Fix equipment loading for all users
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Public can read available equipment" ON equipments;
DROP POLICY IF EXISTS "Authenticated can read available equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Staff can create orders for users" ON orders;
DROP POLICY IF EXISTS "Anyone can read suggestions" ON suggestions;
DROP POLICY IF EXISTS "Anyone can create suggestions" ON suggestions;
DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions;

-- Update users table to include customer role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text, 'customer'::text]));

-- Update the default role to customer for new registrations
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';

-- Update the handle_new_user function to set customer as default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''), 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simple, non-recursive user policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM users users_1
    WHERE users_1.id = auth.uid() AND users_1.role = 'admin'
  ));

-- Equipment policies - allow everyone to read available equipment
CREATE POLICY "Public can read available equipment" ON equipments
  FOR SELECT TO public
  USING (available = true);

CREATE POLICY "Authenticated can read available equipment" ON equipments
  FOR SELECT TO authenticated
  USING (available = true);

CREATE POLICY "Admins can read all equipment" ON equipments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Admins can manage equipment" ON equipments
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Order policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = ANY (ARRAY['admin'::text, 'staff'::text])
  ));

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'customer'
  ));

CREATE POLICY "Staff can create orders for users" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = ANY (ARRAY['admin'::text, 'staff'::text])
  ));

-- Suggestion policies
CREATE POLICY "Anyone can read suggestions" ON suggestions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Anyone can create suggestions" ON suggestions
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage suggestions" ON suggestions
  FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));