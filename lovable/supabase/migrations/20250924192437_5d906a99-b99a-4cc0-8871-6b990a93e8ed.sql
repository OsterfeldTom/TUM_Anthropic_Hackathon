-- Temporarily make user_id nullable to insert mock data
ALTER TABLE public.deals ALTER COLUMN user_id DROP NOT NULL;

-- Insert mock deals for 2 imaginary startups
INSERT INTO public.deals (
  id,
  company_name,
  contact_email,
  stage,
  sector,
  geography,
  ticket_size,
  status,
  avg_score,
  notes,
  user_id
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'NeuralFlow AI',
  'sarah.chen@neuralflow.ai',
  'Series A',
  'AI/ML',
  'North America',
  3500000,
  'completed',
  2.3,
  'Promising AI startup focused on automated data pipeline optimization. Strong technical team with previous exits. Revenue growing 40% MoM.',
  null
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'EcoTech Solutions',
  'marcus.green@ecotech.com',
  'Seed',
  'CleanTech',
  'Europe',
  1200000,
  'completed',
  3.1,
  'B2B cleantech solution for carbon footprint tracking in supply chains. Solid product-market fit but facing competitive pressure. Team needs strengthening.',
  null
);

-- Insert criteria scores for NeuralFlow AI
INSERT INTO public.criteria_scores (
  deal_id,
  criterion,
  score,
  confidence,
  rationale,
  evidence,
  missing_data
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Team', 2, 0.9, 'Exceptional founding team with complementary skills. CEO has 2 previous successful exits in AI space, CTO is former Google AI researcher.', 'LinkedIn profiles show Sarah Chen (CEO) sold previous startup to Microsoft for $150M, David Kim (CTO) published 20+ papers in top AI conferences.', 'Limited information about sales and marketing leadership'),
('550e8400-e29b-41d4-a716-446655440001', 'Business Model', 2, 0.8, 'Strong B2B SaaS model with recurring revenue and high switching costs once integrated.', 'ARR of $2.1M with 98% retention rate. Average contract value of $50K annually.', 'Unclear pricing strategy for enterprise tier'),
('550e8400-e29b-41d4-a716-446655440001', 'Technology', 1, 0.95, 'Pure software solution with proprietary ML algorithms. No hardware dependencies.', 'Patent pending on core optimization algorithm. Built on scalable cloud infrastructure.', null),
('550e8400-e29b-41d4-a716-446655440001', 'Product', 2, 0.85, 'Product addresses real pain point in data engineering. Strong customer validation and NPS of 72.', 'Customer testimonials show 40% reduction in data processing time. 15 enterprise customers including 2 Fortune 500.', 'Limited data on churn reasons'),
('550e8400-e29b-41d4-a716-446655440001', 'Geography', 1, 1.0, 'Based in San Francisco with strong presence in North American market.', 'Headquarters in SF, 85% of customers in North America.', null),
('550e8400-e29b-41d4-a716-446655440001', 'Monetization', 2, 0.9, 'Recurring SaaS revenue model with strong unit economics.', 'Monthly recurring revenue of $175K, gross margin of 87%.', 'Customer acquisition cost trends unclear'),
('550e8400-e29b-41d4-a716-446655440001', 'Ticket Size & Traction Fit', 2, 0.8, '$3.5M raise appropriate for current traction and growth trajectory.', 'Current ARR of $2.1M justifies valuation. Funds will support 18-month runway.', 'Burn rate projections need validation'),
('550e8400-e29b-41d4-a716-446655440001', 'Market', 2, 0.75, 'Large and growing market with relatively few established players in the specific niche.', 'Data pipeline automation market estimated at $8B+ with 25% CAGR. Few direct competitors.', 'Market size estimates vary significantly'),
('550e8400-e29b-41d4-a716-446655440001', 'Revenue & Traction', 2, 0.9, 'Strong revenue growth with good traction metrics.', '$2.1M ARR, growing 40% month-over-month. 15 enterprise customers.', 'Seasonality patterns unknown'),
('550e8400-e29b-41d4-a716-446655440001', 'IP', 3, 0.7, 'Some IP protection through patents but technology could be replicated by larger players.', 'One patent pending, trade secrets in algorithms.', 'Full patent portfolio assessment needed'),
('550e8400-e29b-41d4-a716-446655440001', 'Competition', 3, 0.8, 'Facing potential competition from established players like Snowflake and Databricks.', 'Direct competitors include smaller startups, indirect competition from major cloud providers.', 'Competitive response timeline unclear');

-- Insert criteria scores for EcoTech Solutions  
INSERT INTO public.criteria_scores (
  deal_id,
  criterion,
  score,
  confidence,
  rationale,
  evidence,
  missing_data
) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Team', 3, 0.7, 'Solid technical background but limited commercial experience. Founder has domain expertise but no previous startup experience.', 'Marcus Green has PhD in Environmental Engineering, 8 years at consulting firms. Technical team strong but sales leadership missing.', 'Management team composition and experience levels'),
('550e8400-e29b-41d4-a716-446655440002', 'Business Model', 2, 0.8, 'B2B model with subscription-based revenue. Good potential for recurring income.', 'SaaS platform with annual contracts. Average deal size €25K.', 'Customer churn data incomplete'),
('550e8400-e29b-41d4-a716-446655440002', 'Technology', 2, 0.85, 'Software-based solution with some hardware integration requirements for data collection.', 'Cloud-based platform with IoT sensor integration. Proprietary carbon calculation algorithms.', 'Scalability of hardware components'),
('550e8400-e29b-41d4-a716-446655440002', 'Product', 3, 0.8, 'Addresses real need but product is still evolving. Good early customer feedback.', '12 pilot customers, average implementation time 3 months. Mixed feedback on user interface.', 'Product roadmap and feature prioritization'),
('550e8400-e29b-41d4-a716-446655440002', 'Geography', 1, 1.0, 'Based in Berlin, targeting European market which aligns well with regulatory environment.', 'German headquarters, 100% of customers in EU. Strong regulatory tailwinds.', null),
('550e8400-e29b-41d4-a716-446655440002', 'Monetization', 2, 0.75, 'Recurring revenue model but pricing still being optimized.', '€300K ARR, experimenting with different pricing tiers.', 'Optimal pricing strategy unclear'),
('550e8400-e29b-41d4-a716-446655440002', 'Ticket Size & Traction Fit', 3, 0.9, '€1.2M raise seems appropriate but limited runway given current burn rate.', '€300K ARR with €80K monthly burn. 15-month runway if growth targets met.', 'Detailed financial projections missing'),
('550e8400-e29b-41d4-a716-446655440002', 'Market', 3, 0.7, 'Growing market driven by ESG regulations but becoming increasingly competitive.', 'Carbon management software market growing 20% annually. 50+ competitors identified.', 'Market differentiation strategy unclear'),
('550e8400-e29b-41d4-a716-446655440002', 'Revenue & Traction', 4, 0.8, 'Early stage revenue with moderate growth. Still proving product-market fit.', '€300K ARR, 12 customers, 15% monthly growth rate.', 'Customer retention metrics incomplete'),
('550e8400-e29b-41d4-a716-446655440002', 'IP', 4, 0.6, 'Limited IP protection in a space where regulatory compliance is key differentiator.', 'No patents filed, relying on trade secrets and first-mover advantage.', 'IP strategy and protection plans'),
('550e8400-e29b-41d4-a716-446655440002', 'Competition', 4, 0.85, 'Highly competitive space with both startups and established players entering the market.', 'Competing with Persefoni, Watershed, and IBM Environmental Intelligence Suite.', 'Competitive positioning strategy unclear');