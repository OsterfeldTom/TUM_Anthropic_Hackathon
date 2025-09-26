export interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  team_name: string | null;
  contact_email: string | null;
  research_title: string | null;
  research_area: string | null;
  institution: string | null;
  funding_requested: number | null;
  abstract: string | null;
  source: string | null;
  status: string;
  user_id: string | null;
  pdf_storage_path: string | null;
  research_domain: string | null;
  author: string | null;
  publication_date: string | null;
}

export const APPLICATION_STATUSES = [
  'submitted',
  'uploaded',
  'processing',
  'processed',
  'under_review',
  'accepted', 
  'rejected',
  'needs_revision'
] as const;

export const APPLICATION_SOURCES = [
  'Website',
  'Conference',
  'University',
  'Research Network',
  'Direct Application',
  'Other'
] as const;