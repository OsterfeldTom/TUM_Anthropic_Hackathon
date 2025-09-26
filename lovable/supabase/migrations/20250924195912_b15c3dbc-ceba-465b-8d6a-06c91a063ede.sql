-- Allow public read of criteria_scores in development so detail page can display evaluations
DO $$
BEGIN
  CREATE POLICY "Allow viewing criteria scores for development"
    ON public.criteria_scores
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;