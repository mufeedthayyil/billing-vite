/*
  # Fresh Setup Migration for LensPro Rentals

  1. New Tables
    - `users` - User profiles with roles (admin/staff)
    - `equipments` - Camera equipment catalog with rates
    - `orders` - Rental orders linking users and equipment
    - `suggestions` - Equipment suggestions from users

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for each table
    - Proper role-based access control

  3. Indexes
    - Performance indexes on frequently queried columns
    - Unique constraints where needed

  4. Functions
    - Trigger function to handle new user creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text]))
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
CREATE POLICY "Users can read all orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

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
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample equipment data
INSERT INTO equipments (name, image_url, rate_12hr, rate_24hr, available) VALUES
  ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg', 75, 120, true),
  ('Sony A7R IV', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg', 70, 110, true),
  ('Nikon D850', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg', 65, 100, true),
  ('Canon 24-70mm f/2.8L', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg', 40, 65, true),
  ('Sony 85mm f/1.4 GM', 'https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg', 45, 70, true),
  ('Manfrotto Carbon Tripod', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg', 15, 25, true),
  ('Godox AD600Pro Flash', 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg', 35, 55, true),
  ('DJI Ronin-S Gimbal', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg', 50, 80, true)
ON CONFLICT DO NOTHING;