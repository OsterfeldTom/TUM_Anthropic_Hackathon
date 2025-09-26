-- Add potential_id column to criteria_scores table
ALTER TABLE public.criteria_scores 
ADD COLUMN potential_id uuid REFERENCES public.potentials(id);

-- Create index for better performance
CREATE INDEX idx_criteria_scores_potential_id ON public.criteria_scores(potential_id);

-- Update the existing data to link criteria_scores to potentials if needed
-- (This assumes there's some way to match existing scores to potentials)