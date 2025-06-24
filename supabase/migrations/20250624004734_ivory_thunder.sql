/*
  # Complete LensPro Rentals Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text, check constraint for 'admin'|'staff'|'customer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `equipments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text, nullable)
      - `description` (text, nullable)
      - `rate_12hr` (numeric)
      - `rate_24hr` (numeric)
      - `available` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text, nullable)
      - `equipment_id` (uuid, foreign key)
      - `duration` (text, check constraint for '12hr'|'24hr')
      - `rent_date` (date)
      - `return_date` (date)
      - `total_cost` (numeric)
      - `handled_by` (uuid, foreign key to users, nullable)
      - `status` (text, check constraint, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `suggestions`
      - `id` (uuid, primary key)
      - `suggestion_text` (text)
      - `suggested_by` (text)
      - `status` (text, check constraint, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to equipments
    - Add policies for authenticated users to manage their data
    - Add policies for admin/staff to manage all data
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create equipments table
CREATE TABLE IF NOT EXISTS equipments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  image_url text,
  description text,
  rate_12hr numeric NOT NULL CHECK (rate_12hr >= 0),
  rate_24hr numeric NOT NULL CHECK (rate_24hr >= 0),
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  equipment_id uuid REFERENCES equipments(id) ON DELETE SET NULL,
  duration text NOT NULL CHECK (duration IN ('12hr', '24hr')),
  rent_date date NOT NULL,
  return_date date NOT NULL,
  total_cost numeric NOT NULL CHECK (total_cost >= 0),
  handled_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_text text NOT NULL,
  suggested_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'implemented')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Equipments policies (public read access)
CREATE POLICY "Public read access for equipments" ON equipments
  FOR SELECT TO public USING (true);

CREATE POLICY "Admin/staff can manage equipments" ON equipments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Orders policies
CREATE POLICY "Authenticated users can read orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Suggestions policies
CREATE POLICY "Anyone can read suggestions" ON suggestions
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create suggestions" ON suggestions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admin/staff can manage suggestions" ON suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Insert sample equipment data
INSERT INTO equipments (name, image_url, description, rate_12hr, rate_24hr, available) VALUES
  ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', 'Professional mirrorless camera with 45MP sensor and 8K video recording', 2500, 4000, true),
  ('Sony A7 III', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400', 'Full-frame mirrorless camera with excellent low-light performance', 2000, 3500, true),
  ('Canon 24-70mm f/2.8L', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400', 'Professional standard zoom lens with constant f/2.8 aperture', 800, 1500, true),
  ('Nikon 85mm f/1.4', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400', 'Portrait lens with beautiful bokeh and sharp image quality', 600, 1200, true),
  ('Godox AD200 Flash Kit', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400', 'Portable flash kit with modifiers and wireless trigger', 500, 1000, true),
  ('DJI Ronin RS2', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400', 'Professional camera stabilizer for smooth video recording', 800, 1500, true),
  ('Manfrotto Carbon Tripod', 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400', 'Lightweight carbon fiber tripod with fluid head', 300, 600, true),
  ('Rode VideoMic Pro+', 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=400', 'Professional on-camera microphone with advanced features', 200, 400, true)
ON CONFLICT (id) DO NOTHING;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create admin user (you can change these credentials)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert admin user into auth.users (this would normally be done via Supabase Auth)
  -- Note: In production, create admin via Supabase dashboard or auth.signUp()
  
  -- For now, we'll just ensure the users table is ready for when admin signs up
  -- The admin should register normally, then update their role manually in the database
END $$;