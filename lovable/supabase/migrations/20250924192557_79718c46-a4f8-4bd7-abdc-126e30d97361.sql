-- Insert criteria scores for both deals using the correct deal IDs
DO $$
DECLARE
    neuralflow_id UUID;
    ecotech_id UUID;
BEGIN
    -- Get the actual deal IDs
    SELECT id INTO neuralflow_id FROM public.deals WHERE company_name = 'NeuralFlow AI';
    SELECT id INTO ecotech_id FROM public.deals WHERE company_name = 'EcoTech Solutions';
    
    -- Insert criteria scores for NeuralFlow AI (if not already exist)
    IF NOT EXISTS (SELECT 1 FROM public.criteria_scores WHERE deal_id = neuralflow_id) THEN
        INSERT INTO public.criteria_scores (deal_id, criterion, score, confidence, rationale, evidence, missing_data) VALUES 
        (neuralflow_id, 'Team', 2, 0.9, 'Exceptional founding team with complementary skills. CEO has 2 previous successful exits in AI space, CTO is former Google AI researcher.', 'LinkedIn profiles show Sarah Chen (CEO) sold previous startup to Microsoft for $150M, David Kim (CTO) published 20+ papers in top AI conferences.', 'Limited information about sales and marketing leadership'),
        (neuralflow_id, 'Business Model', 2, 0.8, 'Strong B2B SaaS model with recurring revenue and high switching costs once integrated.', 'ARR of $2.1M with 98% retention rate. Average contract value of $50K annually.', 'Unclear pricing strategy for enterprise tier'),
        (neuralflow_id, 'Technology', 1, 0.95, 'Pure software solution with proprietary ML algorithms. No hardware dependencies.', 'Patent pending on core optimization algorithm. Built on scalable cloud infrastructure.', null),
        (neuralflow_id, 'Product', 2, 0.85, 'Product addresses real pain point in data engineering. Strong customer validation and NPS of 72.', 'Customer testimonials show 40% reduction in data processing time. 15 enterprise customers including 2 Fortune 500.', 'Limited data on churn reasons'),
        (neuralflow_id, 'Geography', 1, 1.0, 'Based in San Francisco with strong presence in North American market.', 'Headquarters in SF, 85% of customers in North America.', null),
        (neuralflow_id, 'Monetization', 2, 0.9, 'Recurring SaaS revenue model with strong unit economics.', 'Monthly recurring revenue of $175K, gross margin of 87%.', 'Customer acquisition cost trends unclear'),
        (neuralflow_id, 'Ticket Size & Traction Fit', 2, 0.8, '$3.5M raise appropriate for current traction and growth trajectory.', 'Current ARR of $2.1M justifies valuation. Funds will support 18-month runway.', 'Burn rate projections need validation'),
        (neuralflow_id, 'Market', 2, 0.75, 'Large and growing market with relatively few established players in the specific niche.', 'Data pipeline automation market estimated at $8B+ with 25% CAGR. Few direct competitors.', 'Market size estimates vary significantly'),
        (neuralflow_id, 'Revenue & Traction', 2, 0.9, 'Strong revenue growth with good traction metrics.', '$2.1M ARR, growing 40% month-over-month. 15 enterprise customers.', 'Seasonality patterns unknown'),
        (neuralflow_id, 'IP', 3, 0.7, 'Some IP protection through patents but technology could be replicated by larger players.', 'One patent pending, trade secrets in algorithms.', 'Full patent portfolio assessment needed'),
        (neuralflow_id, 'Competition', 3, 0.8, 'Facing potential competition from established players like Snowflake and Databricks.', 'Direct competitors include smaller startups, indirect competition from major cloud providers.', 'Competitive response timeline unclear');
    END IF;

    -- Insert criteria scores for EcoTech Solutions (if not already exist)
    IF NOT EXISTS (SELECT 1 FROM public.criteria_scores WHERE deal_id = ecotech_id) THEN
        INSERT INTO public.criteria_scores (deal_id, criterion, score, confidence, rationale, evidence, missing_data) VALUES 
        (ecotech_id, 'Team', 3, 0.7, 'Solid technical background but limited commercial experience. Founder has domain expertise but no previous startup experience.', 'Marcus Green has PhD in Environmental Engineering, 8 years at consulting firms. Technical team strong but sales leadership missing.', 'Management team composition and experience levels'),
        (ecotech_id, 'Business Model', 2, 0.8, 'B2B model with subscription-based revenue. Good potential for recurring income.', 'SaaS platform with annual contracts. Average deal size €25K.', 'Customer churn data incomplete'),
        (ecotech_id, 'Technology', 2, 0.85, 'Software-based solution with some hardware integration requirements for data collection.', 'Cloud-based platform with IoT sensor integration. Proprietary carbon calculation algorithms.', 'Scalability of hardware components'),
        (ecotech_id, 'Product', 3, 0.8, 'Addresses real need but product is still evolving. Good early customer feedback.', '12 pilot customers, average implementation time 3 months. Mixed feedback on user interface.', 'Product roadmap and feature prioritization'),
        (ecotech_id, 'Geography', 1, 1.0, 'Based in Berlin, targeting European market which aligns well with regulatory environment.', 'German headquarters, 100% of customers in EU. Strong regulatory tailwinds.', null),
        (ecotech_id, 'Monetization', 2, 0.75, 'Recurring revenue model but pricing still being optimized.', '€300K ARR, experimenting with different pricing tiers.', 'Optimal pricing strategy unclear'),
        (ecotech_id, 'Ticket Size & Traction Fit', 3, 0.9, '€1.2M raise seems appropriate but limited runway given current burn rate.', '€300K ARR with €80K monthly burn. 15-month runway if growth targets met.', 'Detailed financial projections missing'),
        (ecotech_id, 'Market', 3, 0.7, 'Growing market driven by ESG regulations but becoming increasingly competitive.', 'Carbon management software market growing 20% annually. 50+ competitors identified.', 'Market differentiation strategy unclear'),
        (ecotech_id, 'Revenue & Traction', 4, 0.8, 'Early stage revenue with moderate growth. Still proving product-market fit.', '€300K ARR, 12 customers, 15% monthly growth rate.', 'Customer retention metrics incomplete'),
        (ecotech_id, 'IP', 4, 0.6, 'Limited IP protection in a space where regulatory compliance is key differentiator.', 'No patents filed, relying on trade secrets and first-mover advantage.', 'IP strategy and protection plans'),
        (ecotech_id, 'Competition', 4, 0.85, 'Highly competitive space with both startups and established players entering the market.', 'Competing with Persefoni, Watershed, and IBM Environmental Intelligence Suite.', 'Competitive positioning strategy unclear');
    END IF;
END $$;