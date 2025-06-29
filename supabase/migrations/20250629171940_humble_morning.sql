/*
  # Add Customer Role Support

  1. Changes
    - Update user role constraint to include 'customer'
    - Change default role from 'staff' to 'customer'
    - Update trigger function to create customers by default

  2. Security
    - Update policies to handle customer role
    - Customers can only see their own orders
*/

-- Update the role constraint to include customer
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin'::text, 'staff'::text, 'customer'::text]));

-- Update default role to customer
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';

-- Update the user creation function to set default role as customer
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

-- Update orders policy to allow customers to see only their own orders
DROP POLICY IF EXISTS "Users can read all orders" ON orders;
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

-- Allow customers to create orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;
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

-- Allow staff and admin to create orders for any user
CREATE POLICY "Staff can create orders for users" ON orders
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );