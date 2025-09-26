export interface Potential {
  id: string;
  created_at: string;
  company_name?: string | null;
  contact_email?: string | null;
  pdf_url?: string | null;
  pdf_storage_path?: string | null;
  status: string;
  avg_score: number | null;
  notes: string | null;
  progress_stage: number | null;
  action_stage?: number | null;
  user_id?: string;
  application_id: string | null;
  overall_confindence?: string | null;
  applications?: {
    research_title: string;
    author: string;
    institution: string;
    research_area?: string;
    abstract?: string;
  };
}

export interface CriteriaScore {
  id: string;
  potential_id: string;
  criterion?: string | null;
  criterion_id?: string | null; // backward compatibility until DB migration
  score: number;
  confidence: number;
  rationale: string | null;
  evidence: string | null;
  missing_data: string | null;
  raw: any;
}

export interface N8NCallbackPayload {
  potential_id: string;
  summary: string;
  criteria: {
    criterion: string;
    score: number;
    confidence: number;
    rationale: string;
    evidence: string;
    missing_data: string;
    raw: any;
  }[];
}

export const CRITERIA_LIST = [
  'Novelty / Originality of Idea',
  'Technological Feasibility',
  'Scalability',
  'Impact Potential (Societal/Economic)',
  'Alignment with SPRIN-D "Breakthrough" Spirit',
  'Market / Application Potential',
  'Time Horizon to Market Readiness',
  'Team / Research Excellence',
  'Risk/Return Balance',
  'Strategic Fit for Germany/Europe'
] as const;
