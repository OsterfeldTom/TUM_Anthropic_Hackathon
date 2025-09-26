-- Temporarily update RLS policy for deals to allow development updates when user_id is null
DROP POLICY IF EXISTS "Users can update their own deals" ON public.deals;

CREATE POLICY "Users can update their own deals or deals without user_id" 
ON public.deals 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);