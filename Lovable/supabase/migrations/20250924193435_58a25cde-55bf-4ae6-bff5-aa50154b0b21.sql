-- Temporarily allow viewing deals without authentication for development
-- This will let us see the mock data

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own deals" ON deals;

-- Create a more permissive policy for development that allows viewing deals without auth
CREATE POLICY "Allow viewing deals for development" 
ON deals 
FOR SELECT 
USING (true);

-- Keep the restrictive policies for other operations
-- Users can still only create/update/delete their own deals when authenticated