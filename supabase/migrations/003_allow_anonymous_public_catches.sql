-- Migration: Allow anonymous users to view public catches
-- Date: 2026-01-07

-- Drop the existing policy that only allows authenticated users
DROP POLICY IF EXISTS "Users can view public catches" ON catches;

-- Create a new policy that allows ANYONE (including anonymous users) to view public catches
CREATE POLICY "Anyone can view public catches"
  ON catches FOR SELECT
  USING (is_public = TRUE);

-- Note: The policy "Users can view own catches" still exists and allows users to see their own catches
-- regardless of the is_public flag
