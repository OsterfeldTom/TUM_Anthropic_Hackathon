-- Remove duplicate criterion records, keeping only the latest one for each deal-criterion combination
DELETE FROM public.criteria_scores 
WHERE id NOT IN (
  SELECT DISTINCT ON (deal_id, criterion) id
  FROM public.criteria_scores
  ORDER BY deal_id, criterion, id DESC
);

-- Add unique constraint to ensure only one criterion record per deal
ALTER TABLE public.criteria_scores 
ADD CONSTRAINT unique_deal_criterion 
UNIQUE (deal_id, criterion);