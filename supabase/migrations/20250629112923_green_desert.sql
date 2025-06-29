/*
  # LensPro Rentals Database Schema - Clean Setup

  1. New Tables
    - `users` - User profiles with roles (admin, staff)
    - `equipments` - Camera equipment catalog with rates
    - `orders` - Rental orders and bookings
    - `suggestions` - User equipment suggestions

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create user creation trigger

  3. Sample Data
    - Insert sample equipment for testing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects in correct order to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Drop existing policies
DO $$ 
BEGIN
    -- Drop users policies
    DROP POLICY IF EXISTS "Users can read own data" ON users;
    DROP POLICY IF EXISTS "Users can update own data" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;
    
    -- Drop equipments policies
    DROP POLICY IF EXISTS "Anyone can read available equipment" ON equipments;
    DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
    DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;
    
    -- Drop orders policies
    DROP POLICY IF EXISTS "Users can read all orders" ON orders;
    DROP POLICY IF EXISTS "Users can create orders" ON orders;
    
    -- Drop suggestions policies
    DROP POLICY IF EXISTS "Anyone can read suggestions" ON suggestions;
    DROP POLICY IF EXISTS "Anyone can create suggestions" ON suggestions;
    DROP POLICY IF EXISTS "Admins can manage suggestions" ON suggestions;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignore if tables don't exist yet
END $$;

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS equipments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz DEFAULT now()
);

-- Create equipments table
CREATE TABLE equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text NOT NULL,
  rate_12hr numeric NOT NULL CHECK (rate_12hr >= 0),
  rate_24hr numeric NOT NULL CHECK (rate_24hr >= 0),
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  duration text NOT NULL CHECK (duration IN ('12hr', '24hr')),
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  rent_date timestamptz NOT NULL,
  return_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create suggestions table
CREATE TABLE suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_text text NOT NULL,
  suggested_by text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_equipments_available ON equipments(available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_equipment_id ON orders(equipment_id);
CREATE INDEX idx_users_role ON users(role);

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Equipments policies
CREATE POLICY "Anyone can read available equipment" ON equipments
  FOR SELECT USING (available = true);

CREATE POLICY "Admins can read all equipment" ON equipments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage equipment" ON equipments
  FOR ALL USING (
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
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create suggestions" ON suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage suggestions" ON suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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