-- Drop existing RLS policies that require authentication
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Create new public policies (no auth required)
CREATE POLICY "Anyone can view preferences" 
ON public.user_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete preferences" 
ON public.user_preferences 
FOR DELETE 
USING (true);

-- Also remove the user_id column requirement since we don't need it without auth
ALTER TABLE public.user_preferences ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_criterion_key;

-- Add a session_id column to track preferences by session instead
ALTER TABLE public.user_preferences ADD COLUMN session_id TEXT;

-- Create new unique constraint using session_id instead of user_id
ALTER TABLE public.user_preferences ADD CONSTRAINT user_preferences_session_criterion_unique UNIQUE(session_id, criterion);