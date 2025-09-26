export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  contact_email: string | null;
  website: string | null;
  sector: string | null;
  geography: string | null;
  stage: string | null;
  description: string | null;
  source: string | null;
  status: string;
  user_id: string;
}

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'responded', 
  'converted_to_deal',
  'not_interested'
] as const;

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Event',
  'Social Media',
  'Cold Outreach',
  'Other'
] as const;