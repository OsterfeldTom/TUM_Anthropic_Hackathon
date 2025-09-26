-- Add progress_stage column to deals table
ALTER TABLE public.deals 
ADD COLUMN progress_stage INTEGER DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.deals.progress_stage IS 'Deal progress stage: 0=Manual Review Approved, 1=Discovery Call, 2=Deep Analysis, 3=Management Pitch, 4=Contract Negotiation, 5=Invested';