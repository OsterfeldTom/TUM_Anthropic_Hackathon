-- Create a bucket for research papers
INSERT INTO storage.buckets (id, name, public)
VALUES ('research-papers', 'research-papers', false);

-- Create storage policies for research papers
CREATE POLICY "Users can upload their own research papers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'research-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own research papers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'research-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own research papers"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'research-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own research papers"
ON storage.objects
FOR DELETE
USING (bucket_id = 'research-papers' AND auth.uid()::text = (storage.foldername(name))[1]);