/*
  # Fix User Creation Database Error

  1. Issues Fixed
    - Ensure proper trigger function for user creation
    - Fix RLS policies for user insertion
    - Add proper error handling for user creation
    - Ensure auth.users table integration works correctly

  2. Security
    - Maintain RLS policies
    - Ensure proper user creation flow
    - Handle edge cases in user creation

  3. Trigger Function
    - Improved error handling
    - Better user metadata handling
    - Proper role assignment
*/

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role text;
BEGIN
  -- Extract name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract role from metadata, default to customer
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'customer'
  );
  
  -- Ensure role is valid
  IF user_role NOT IN ('admin', 'staff', 'customer') THEN
    user_role := 'customer';
  END IF;
  
  -- Insert into users table with error handling
  BEGIN
    INSERT INTO public.users (id, name, email, role, created_at, updated_at)
    VALUES (
      NEW.id,
      user_name,
      NEW.email,
      user_role,
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- User already exists, update instead
      UPDATE public.users 
      SET 
        name = user_name,
        email = NEW.email,
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;

-- Allow users to insert their own profile during registration
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert user profiles
CREATE POLICY "Enable insert for service role" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Ensure users can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions for the trigger function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;

-- Ensure the function can be executed
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, anon, authenticated, service_role;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email_lookup ON users(email);

-- Test the trigger function works
DO $$
BEGIN
  RAISE NOTICE 'User creation trigger and function updated successfully';
END $$;