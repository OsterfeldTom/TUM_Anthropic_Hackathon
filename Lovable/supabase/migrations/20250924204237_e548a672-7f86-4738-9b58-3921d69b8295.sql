-- Recreate UPDATE policy to include WITH CHECK so updates persist even for unauthenticated dev rows
DROP POLICY IF EXISTS "Users can update their own deals or deals without user_id" ON public.deals;

CREATE POLICY "Users can update their own deals or deals without user_id"
ON public.deals
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);