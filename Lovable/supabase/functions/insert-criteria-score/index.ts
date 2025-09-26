import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CriteriaScoreInput {
  potential_id?: string | null;
  application_id?: string;
  criterion_id: string;
  score: number;
  confidence: number;
  rationale?: string | null;
  evidence?: string | null;
  missing_data?: string | null;
  raw?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Only allow POST method
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('Received request body:', body);

    // Validate required fields
    if (!body.criterion_id || typeof body.score !== 'number' || typeof body.confidence !== 'number') {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: criterion_id, score, and confidence are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate score and confidence ranges
    if (body.score < 0 || body.score > 10) {
      console.log('Invalid score range:', body.score);
      return new Response(
        JSON.stringify({ error: 'Score must be between 0 and 10' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (body.confidence < 0 || body.confidence > 1) {
      console.log('Invalid confidence range:', body.confidence);
      return new Response(
        JSON.stringify({ error: 'Confidence must be between 0 and 1' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate that either potential_id or application_id is provided
    if (!body.potential_id && !body.application_id) {
      console.log('Missing potential_id or application_id');
      return new Response(
        JSON.stringify({ 
          error: 'Either potential_id or application_id is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use potential_id directly if provided, otherwise resolve from application_id
    let effectivePotentialId: string | null = body.potential_id || null;
    
    if (!effectivePotentialId && body.application_id) {
      const { data: pot, error: potError } = await supabase
        .from('potentials')
        .select('id')
        .eq('application_id', body.application_id)
        .maybeSingle();
      if (potError) {
        console.error('Error looking up potential by application_id:', potError);
        return new Response(
          JSON.stringify({ error: 'Failed to resolve potential_id from application_id' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!pot) {
        return new Response(
          JSON.stringify({ error: 'No potential found for provided application_id' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      effectivePotentialId = pot.id;
    }

    // Verify that the potential exists
    if (effectivePotentialId) {
      const { data: potentialExists, error: checkError } = await supabase
        .from('potentials')
        .select('id')
        .eq('id', effectivePotentialId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking potential existence:', checkError);
        return new Response(
          JSON.stringify({ error: 'Failed to verify potential exists' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!potentialExists) {
        console.log('Potential not found:', effectivePotentialId);
        return new Response(
          JSON.stringify({ error: 'Potential not found with provided ID' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare data for insertion
    const criteriaScoreData: CriteriaScoreInput = {
      potential_id: effectivePotentialId,
      criterion_id: body.criterion_id,
      score: body.score,
      confidence: body.confidence,
      rationale: body.rationale || null,
      evidence: body.evidence || null,
      missing_data: body.missing_data || null,
      raw: body.raw || null,
    };

    console.log('Inserting criteria score:', criteriaScoreData);

    // Insert into criteria_scores table
    const { data, error } = await supabase
      .from('criteria_scores')
      .insert(criteriaScoreData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to insert criteria score', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully inserted criteria score:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data,
        message: 'Criteria score inserted successfully' 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});