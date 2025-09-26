-- Rename deals table to potentials
ALTER TABLE deals RENAME TO potentials;

-- Remove unnecessary columns
ALTER TABLE potentials DROP COLUMN IF EXISTS sector;
ALTER TABLE potentials DROP COLUMN IF EXISTS stage;
ALTER TABLE potentials DROP COLUMN IF EXISTS geography;
ALTER TABLE potentials DROP COLUMN IF EXISTS ticket_size;

-- Add application_id to link with applications table
ALTER TABLE potentials ADD COLUMN application_id UUID REFERENCES applications(id);

-- Update RLS policies for the renamed table
DROP POLICY IF EXISTS "Users can create their own deals" ON potentials;
DROP POLICY IF EXISTS "Users can delete their own deals" ON potentials;
DROP POLICY IF EXISTS "Allow viewing deals for development" ON potentials;
DROP POLICY IF EXISTS "Users can update their own deals or deals without user_id" ON potentials;

-- Create new RLS policies for potentials
CREATE POLICY "Users can create their own potentials" 
ON potentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own potentials" 
ON potentials 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Allow viewing potentials for development" 
ON potentials 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own potentials or potentials without user_id" 
ON potentials 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (user_id IS NULL))
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- Update foreign key references in other tables
ALTER TABLE criteria_scores DROP CONSTRAINT IF EXISTS criteria_scores_deal_id_fkey;
ALTER TABLE criteria_scores ADD CONSTRAINT criteria_scores_potential_id_fkey 
FOREIGN KEY (deal_id) REFERENCES potentials(id);

ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_deal_id_fkey;
ALTER TABLE assignments ADD CONSTRAINT assignments_potential_id_fkey 
FOREIGN KEY (deal_id) REFERENCES potentials(id);