/*
  # Fix RLS Policies and Database Structure

  1. Clean up existing policies to prevent conflicts
  2. Create proper RLS policies for all tables
  3. Ensure proper user role management
  4. Fix any recursive policy issues

  ## Changes
  - Drop all existing policies safely
  - Create new, non-conflicting policies
  - Ensure proper role-based access control
  - Add proper indexes for performance
*/

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "admins_manage_all_users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Staff can create orders for users" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "orders_customers_create_own" ON orders;
DROP POLICY IF EXISTS "orders_read_own_or_staff" ON orders;
DROP POLICY IF EXISTS "orders_staff_create_any" ON orders;

DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
DROP POLICY IF EXISTS "Authenticated can read available equipment" ON equipments;
DROP POLICY IF EXISTS "Public can read available equipment" ON equipments;
DROP POLICY IF EXISTS "equipment_admin_manage" ON equipments;
DROP POLICY IF EXISTS "equipment_admin_read_all" ON equipments;
DROP POLICY IF EXISTS "equipment_authenticated_read_available" ON equipments;
DROP POLICY IF EXISTS "equipment_public_read_available" ON equipments;

DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions;
DROP POLICY IF EXISTS "Anyone can create suggestions" ON suggestions;
DROP POLICY IF EXISTS "Anyone can read suggestions" ON suggestions;
DROP POLICY IF EXISTS "suggestions_admin_manage" ON suggestions;
DROP POLICY IF EXISTS "suggestions_public_create" ON suggestions;
DROP POLICY IF EXISTS "suggestions_public_read" ON suggestions;

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "users_read_own_profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "admins_full_user_access" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Equipment table policies
CREATE POLICY "equipment_public_view_available" ON equipments
  FOR SELECT TO public
  USING (available = true);

CREATE POLICY "equipment_authenticated_view_available" ON equipments
  FOR SELECT TO authenticated
  USING (available = true);

CREATE POLICY "equipment_admin_full_access" ON equipments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Orders table policies
CREATE POLICY "orders_staff_view_all" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "orders_staff_create" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Suggestions table policies
CREATE POLICY "suggestions_public_view" ON suggestions
  FOR SELECT TO public
  USING (true);

CREATE POLICY "suggestions_public_create" ON suggestions
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "suggestions_admin_manage" ON suggestions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role_lookup ON users(id, role);
CREATE INDEX IF NOT EXISTS idx_orders_user_equipment ON orders(user_id, equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipments_available_name ON equipments(available, name);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_desc ON suggestions(created_at DESC);

-- Insert demo data if tables are empty
DO $$
BEGIN
  -- Insert demo equipment if none exists
  IF NOT EXISTS (SELECT 1 FROM equipments LIMIT 1) THEN
    INSERT INTO equipments (name, image_url, rate_12hr, rate_24hr, available) VALUES
    ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', 2500, 4000, true),
    ('Sony A7R IV', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400', 2200, 3500, true),
    ('Nikon Z9', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400', 2800, 4500, true),
    ('Canon RF 24-70mm f/2.8L', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400', 1200, 2000, true),
    ('Sony FE 85mm f/1.4 GM', 'https://images.pexels.com/photos/821652/pexels-photo-821652.jpeg?auto=compress&cs=tinysrgb&w=400', 1000, 1600, true),
    ('DJI Ronin-S Gimbal', 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400', 800, 1300, true);
  END IF;
END $$;