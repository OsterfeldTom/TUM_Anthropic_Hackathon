-- Create the deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  company_name TEXT,
  contact_email TEXT,
  stage TEXT,
  sector TEXT,
  geography TEXT,
  ticket_size NUMERIC,
  pdf_url TEXT,
  pdf_storage_path TEXT,
  status TEXT DEFAULT 'processing',
  avg_score NUMERIC,
  notes TEXT,
  user_id UUID REFERENCES auth.users NOT NULL
);

-- Create the criteria_scores table
CREATE TABLE public.criteria_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  score NUMERIC CHECK (score >= 1 AND score <= 5),
  confidence NUMERIC,
  rationale TEXT,
  evidence TEXT,
  missing_data TEXT,
  raw JSONB
);

-- Create the assignments table (optional for future)
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  analyst TEXT,
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deals
CREATE POLICY "Users can view their own deals" 
ON public.deals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" 
ON public.deals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" 
ON public.deals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for criteria_scores
CREATE POLICY "Users can view criteria scores for their deals" 
ON public.criteria_scores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = criteria_scores.deal_id 
  AND deals.user_id = auth.uid()
));

CREATE POLICY "Users can create criteria scores for their deals" 
ON public.criteria_scores 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = criteria_scores.deal_id 
  AND deals.user_id = auth.uid()
));

CREATE POLICY "Users can update criteria scores for their deals" 
ON public.criteria_scores 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = criteria_scores.deal_id 
  AND deals.user_id = auth.uid()
));

CREATE POLICY "Users can delete criteria scores for their deals" 
ON public.criteria_scores 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = criteria_scores.deal_id 
  AND deals.user_id = auth.uid()
));

-- Create RLS policies for assignments
CREATE POLICY "Users can view assignments for their deals" 
ON public.assignments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = assignments.deal_id 
  AND deals.user_id = auth.uid()
));

CREATE POLICY "Users can create assignments for their deals" 
ON public.assignments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.deals 
  WHERE deals.id = assignments.deal_id 
  AND deals.user_id = auth.uid()
));

-- Create the pitchdecks storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pitchdecks', 'pitchdecks', true);

-- Create storage policies for pitchdecks bucket
CREATE POLICY "Users can view their own pitch decks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pitchdecks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own pitch decks" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'pitchdecks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own pitch decks" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'pitchdecks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pitch decks" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'pitchdecks' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_avg_score ON public.deals(avg_score);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_criteria_scores_deal_id ON public.criteria_scores(deal_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;