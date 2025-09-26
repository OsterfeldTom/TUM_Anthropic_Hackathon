-- Allow public access to create applications without authentication
CREATE POLICY "Allow public application creation" 
ON public.applications 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Allow public access to view applications without user_id
CREATE POLICY "Allow public viewing of applications without user_id" 
ON public.applications 
FOR SELECT 
USING (user_id IS NULL);

-- Allow public access to update applications without user_id
CREATE POLICY "Allow public updating of applications without user_id" 
ON public.applications 
FOR UPDATE 
USING (user_id IS NULL);

-- Create public storage policies for research papers
CREATE POLICY "Allow public upload to research-papers bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'research-papers');

CREATE POLICY "Allow public viewing of research-papers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'research-papers');