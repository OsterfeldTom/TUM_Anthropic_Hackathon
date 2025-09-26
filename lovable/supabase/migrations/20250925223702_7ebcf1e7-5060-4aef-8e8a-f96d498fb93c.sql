-- Allow updating potentials from the client (development)
CREATE POLICY "Allow updating potentials for development"
ON public.potentials
FOR UPDATE
USING (true)
WITH CHECK (true);
