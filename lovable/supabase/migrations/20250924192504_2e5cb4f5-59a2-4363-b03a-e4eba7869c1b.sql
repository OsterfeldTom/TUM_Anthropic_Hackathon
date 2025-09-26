-- Check if mock data already exists and insert only if not present
DO $$ 
BEGIN
  -- Insert mock deals only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM public.deals WHERE company_name = 'NeuralFlow AI') THEN
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
      '550e8400-e29b-41d4-a716-446655440003',
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
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.deals WHERE company_name = 'EcoTech Solutions') THEN
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
      '550e8400-e29b-41d4-a716-446655440004',
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
  END IF;
END $$;