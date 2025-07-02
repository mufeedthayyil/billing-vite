/*
  # Fix Authentication and RLS Policies

  1. Security
    - Fix infinite recursion in user policies
    - Simplify equipment access policies
    - Update order policies for proper role-based access
    - Fix suggestion policies

  2. Performance
    - Add missing indexes for better query performance
*/

-- Drop existing problematic policies with CASCADE to handle dependencies
DROP POLICY IF EXISTS "Admins can manage all users" ON users CASCADE;
DROP POLICY IF EXISTS "Users can read own data" ON users CASCADE;
DROP POLICY IF EXISTS "Users can update own data" ON users CASCADE;

-- Drop equipment policies
DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments CASCADE;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments CASCADE;
DROP POLICY IF EXISTS "Authenticated can read available equipment" ON equipments CASCADE;
DROP POLICY IF EXISTS "Public can read available equipment" ON equipments CASCADE;

-- Drop order policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders CASCADE;
DROP POLICY IF EXISTS "Users can read all orders" ON orders CASCADE;
DROP POLICY IF EXISTS "Users can create orders" ON orders CASCADE;
DROP POLICY IF EXISTS "Customers can create orders" ON orders CASCADE;
DROP POLICY IF EXISTS "Staff can create orders for users" ON orders CASCADE;

-- Drop suggestion policies
DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions CASCADE;
DROP POLICY IF EXISTS "Anyone can create suggestions" ON suggestions CASCADE;
DROP POLICY IF EXISTS "Anyone can read suggestions" ON suggestions CASCADE;

-- Create simplified user policies that don't cause recursion
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "admins_manage_all_users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create equipment policies without recursive user checks
CREATE POLICY "equipment_public_read_available" ON equipments
  FOR SELECT TO public
  USING (available = true);

CREATE POLICY "equipment_authenticated_read_available" ON equipments
  FOR SELECT TO authenticated 
  USING (available = true);

CREATE POLICY "equipment_admin_read_all" ON equipments
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "equipment_admin_manage" ON equipments
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create order policies
CREATE POLICY "orders_read_own_or_staff" ON orders
  FOR SELECT TO authenticated 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "orders_customers_create_own" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'customer'
    )
  );

CREATE POLICY "orders_staff_create_any" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role IN ('admin', 'staff')
    )
  );

-- Create suggestion policies
CREATE POLICY "suggestions_public_read" ON suggestions
  FOR SELECT TO public 
  USING (true);

CREATE POLICY "suggestions_public_create" ON suggestions
  FOR INSERT TO public 
  WITH CHECK (true);

CREATE POLICY "suggestions_admin_manage" ON suggestions
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Add missing indexes for better performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
    CREATE INDEX idx_users_email ON users(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_role') THEN
    CREATE INDEX idx_users_role ON users(role);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_equipments_name') THEN
    CREATE INDEX idx_equipments_name ON equipments(name);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_equipments_available') THEN
    CREATE INDEX idx_equipments_available ON equipments(available);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_user_id') THEN
    CREATE INDEX idx_orders_user_id ON orders(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_equipment_id') THEN
    CREATE INDEX idx_orders_equipment_id ON orders(equipment_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_created_at') THEN
    CREATE INDEX idx_orders_created_at ON orders(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_suggestions_created_at') THEN
    CREATE INDEX idx_suggestions_created_at ON suggestions(created_at);
  END IF;
END $$;