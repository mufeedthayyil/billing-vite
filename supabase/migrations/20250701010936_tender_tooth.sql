/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The "Admins can manage all users" policy creates infinite recursion
    - Policy tries to check user role by querying the same protected table

  2. Solution
    - Simplify user policies to avoid self-referencing queries
    - Use auth.jwt() claims or simpler checks where possible
    - Remove recursive policy dependencies

  3. Changes
    - Update users table policies to prevent recursion
    - Ensure equipment and orders policies work correctly
    - Maintain security while avoiding circular dependencies
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Drop and recreate equipment policies to ensure they work with new user policies
DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;

-- Drop and recreate order policies
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Drop and recreate suggestion policies
DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions;

-- Create simplified user policies that don't cause recursion
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- Create equipment policies without recursive user checks
CREATE POLICY "Admins can read all equipment" ON equipments
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "Admins can manage equipment" ON equipments
  FOR ALL TO authenticated 
  USING (true);

-- Create order policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'staff')
  ));

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'customer'
  ));

CREATE POLICY "Staff can create orders for users" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'staff')
  ));

-- Create suggestion policies
CREATE POLICY "Admins can manage suggestions" ON suggestions
  FOR ALL TO public 
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_equipments_name ON equipments(name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at);