-- Drop the old user_preferences table
DROP TABLE IF EXISTS public.user_preferences;

-- Create the new criteria_preferences table
CREATE TABLE public.criteria_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  criterion text NOT NULL UNIQUE,
  factor integer NOT NULL DEFAULT 3,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.criteria_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view criteria preferences" 
ON public.criteria_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update criteria preferences" 
ON public.criteria_preferences 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert criteria preferences" 
ON public.criteria_preferences 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_criteria_preferences_updated_at
BEFORE UPDATE ON public.criteria_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default criteria with factor 3
INSERT INTO public.criteria_preferences (criterion) VALUES 
('Team'),
('Business Model'),
('Technology'),
('Product'),
('Geography'),
('Monetization'),
('Ticket Size & Traction Fit'),
('Market'),
('Revenue & Traction'),
('IP'),
('Competition');