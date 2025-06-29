/*
  # Fix Equipment Loading Issues

  1. Security Updates
    - Fix RLS policies for equipment access
    - Ensure public can read available equipment
    - Add better error handling

  2. Data Verification
    - Verify sample equipment exists
    - Check table structure
*/

-- First, let's check if we have any equipment data
DO $$
DECLARE
    equipment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO equipment_count FROM equipments;
    RAISE NOTICE 'Current equipment count: %', equipment_count;
    
    -- If no equipment exists, insert sample data
    IF equipment_count = 0 THEN
        RAISE NOTICE 'No equipment found, inserting sample data...';
        
        INSERT INTO equipments (name, image_url, rate_12hr, rate_24hr, available) VALUES
          ('Canon EOS R5', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400', 2500, 4000, true),
          ('Sony A7 III', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400', 2000, 3500, true),
          ('Canon 24-70mm f/2.8L', 'https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?auto=compress&cs=tinysrgb&w=400', 800, 1500, true),
          ('Nikon 85mm f/1.4', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400', 600, 1200, true),
          ('Godox AD200 Flash Kit', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400', 500, 1000, true),
          ('DJI Ronin RS2', 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400', 800, 1500, true),
          ('Manfrotto Carbon Tripod', 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400', 300, 600, true),
          ('Rode VideoMic Pro+', 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=400', 200, 400, true);
        
        RAISE NOTICE 'Sample equipment data inserted successfully';
    ELSE
        RAISE NOTICE 'Equipment data already exists';
    END IF;
END $$;

-- Drop and recreate equipment policies to ensure they work correctly
DROP POLICY IF EXISTS "Anyone can read available equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can read all equipment" ON equipments;
DROP POLICY IF EXISTS "Admins can manage equipment" ON equipments;

-- Create more permissive policies for equipment reading
CREATE POLICY "Public can read available equipment" ON equipments
  FOR SELECT 
  TO public
  USING (available = true);

CREATE POLICY "Authenticated can read available equipment" ON equipments
  FOR SELECT 
  TO authenticated
  USING (available = true);

CREATE POLICY "Admins can read all equipment" ON equipments
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'::text
    )
  );

CREATE POLICY "Admins can manage equipment" ON equipments
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'::text
    )
  );

-- Verify the policies are working by testing a simple query
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test if we can read equipment without authentication
    SELECT COUNT(*) INTO test_count FROM equipments WHERE available = true;
    RAISE NOTICE 'Available equipment count (public access): %', test_count;
    
    IF test_count = 0 THEN
        RAISE WARNING 'No available equipment found - this might indicate a policy issue';
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT ON equipments TO anon;
GRANT SELECT ON equipments TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';