/*
  # LensPro Rentals Database Setup - Fixed Migration
  
  This migration safely creates all necessary tables and policies for the LensPro Rentals application.
  It handles existing objects by dropping and recreating them to ensure a clean state.
  
  1. Tables: users, equipments, orders, suggestions
  2. Security: RLS policies for proper access control
  3. Sample Data: Equipment catalog with rental rates
  4. Triggers: Automatic user profile creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing policies and triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS "Users can read own data" ON users;
    DROP POLICY IF EXISTS "Users can update own data" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;
    
    -- Equipment policies
    DROP POLICY IF EXISTS "Public can read available equipment" ON equipments;
    DROP POLICY IF EXISTS "Authenticated can read available equipment" ON equipments;
    DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
    DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;
    
    -- Orders policies
    DROP POLICY IF EXISTS "Users can read all orders" ON orders;
    DROP POLICY IF EXISTS "Users can create orders" ON orders;
    DROP POLICY IF EXISTS "Users can read own orders" ON orders;
    DROP POLICY IF EXISTS "Customers can create orders" ON orders;
    DROP POLICY IF EXISTS "Staff can create orders for users" ON orders;
    
    -- Suggestions policies
    DROP POLICY IF EXISTS "Anyone can read suggestions" ON suggestions;
    DROP POLICY IF EXISTS "Anyone can create suggestions" ON suggestions;
    DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Tables don't exist yet, which is fine
    WHEN undefined_object THEN
        NULL; -- Policies don't exist yet, which is fine
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text, 'customer'::text]))
);

-- Create equipments table
CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text NOT NULL,
  rate_12hr numeric NOT NULL DEFAULT 0,
  rate_24hr numeric NOT NULL DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT equipments_rate_12hr_check CHECK (rate_12hr >= 0),
  CONSTRAINT equipments_rate_24hr_check CHECK (rate_24hr >= 0)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  duration text NOT NULL DEFAULT '24hr',
  total_cost numeric NOT NULL DEFAULT 0,
  rent_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT orders_duration_check CHECK (duration = ANY (ARRAY['12hr'::text, '24hr'::text])),
  CONSTRAINT orders_total_cost_check CHECK (total_cost >= 0)
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_text text NOT NULL,
  suggested_by text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users USING btree (role);
CREATE INDEX IF NOT EXISTS idx_equipments_name ON equipments USING btree (name);
CREATE INDEX IF NOT EXISTS idx_equipments_available ON equipments USING btree (available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_equipment_id ON orders USING btree (equipment_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions USING btree (created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO public
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- Equipment policies
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

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Customers can create orders" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'customer'
    )
  );

CREATE POLICY "Staff can create orders for users" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Suggestions policies
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

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', ''),
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample equipment data
INSERT INTO equipments (name, image_url, rate_12hr, rate_24hr, available) VALUES
  ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', 2500, 4000, true),
  ('Sony A7R IV', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg', 2000, 3500, true),
  ('Nikon D850', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg', 1800, 3000, true),
  ('Canon 24-70mm f/2.8L', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg', 800, 1500, true),
  ('Sony 85mm f/1.4 GM', 'https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg', 600, 1200, true),
  ('Manfrotto Carbon Tripod', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg', 300, 600, true),
  ('Godox AD600Pro Flash', 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg', 500, 1000, true),
  ('DJI Ronin-S Gimbal', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg', 800, 1500, true)
ON CONFLICT DO NOTHING;