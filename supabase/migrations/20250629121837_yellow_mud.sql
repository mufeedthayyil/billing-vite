/*
  # Fresh LensPro Rentals Database Setup

  1. Clean Setup
    - Drop all existing tables and policies
    - Create fresh schema with proper structure
    - Insert sample data

  2. Tables
    - `users` - User profiles with roles
    - `equipments` - Camera equipment catalog
    - `orders` - Rental orders
    - `suggestions` - Equipment suggestions

  3. Security
    - Enable RLS on all tables
    - Create comprehensive policies
    - User creation trigger
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS equipments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- Create equipments table
CREATE TABLE equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text NOT NULL,
  rate_12hr numeric NOT NULL DEFAULT 0 CHECK (rate_12hr >= 0),
  rate_24hr numeric NOT NULL DEFAULT 0 CHECK (rate_24hr >= 0),
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  duration text NOT NULL DEFAULT '24hr' CHECK (duration IN ('12hr', '24hr')),
  total_cost numeric NOT NULL DEFAULT 0 CHECK (total_cost >= 0),
  rent_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create suggestions table
CREATE TABLE suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_text text NOT NULL,
  suggested_by text DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_equipments_available ON equipments(available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_equipment_id ON orders(equipment_id);

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO public USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO public USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO public USING (
    EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid() 
      AND users_1.role = 'admin'
    )
  );

-- Equipment policies
CREATE POLICY "Public can read available equipment" ON equipments
  FOR SELECT TO public USING (available = true);

CREATE POLICY "Authenticated can read available equipment" ON equipments
  FOR SELECT TO authenticated USING (available = true);

CREATE POLICY "Admins can read all equipment" ON equipments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage equipment" ON equipments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can read all orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Suggestions policies
CREATE POLICY "Anyone can read suggestions" ON suggestions
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create suggestions" ON suggestions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage suggestions" ON suggestions
  FOR ALL TO public USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create user creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'staff'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT SELECT ON equipments TO anon;
GRANT SELECT ON equipments TO authenticated;
GRANT SELECT ON suggestions TO anon;
GRANT INSERT ON suggestions TO anon;

-- Insert sample equipment data
INSERT INTO equipments (name, image_url, rate_12hr, rate_24hr, available) VALUES
  ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', 2500, 4000, true),
  ('Sony A7 III', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400', 2000, 3500, true),
  ('Canon 24-70mm f/2.8L', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400', 800, 1500, true),
  ('Nikon 85mm f/1.4', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400', 600, 1200, true),
  ('Godox AD200 Flash Kit', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400', 500, 1000, true),
  ('DJI Ronin RS2', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400', 800, 1500, true),
  ('Manfrotto Carbon Tripod', 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400', 300, 600, true),
  ('Rode VideoMic Pro+', 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=400', 200, 400, true);