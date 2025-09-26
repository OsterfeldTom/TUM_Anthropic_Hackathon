import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NCallbackPayload {
  potential_id?: string;
  application_id?: string;
  summary: string;
  criteria: Array<{
    criterion: string; // incoming label or id
    score: number;
    confidence: number;
    rationale: string;
    evidence: string;
    missing_data: string;
    raw: any;
  }>;
}

Deno.serve(async (req) => {
  console.log('N8N callback function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: N8NCallbackPayload = await req.json();
    console.log('Received N8N callback:', JSON.stringify(payload, null, 2));

    const { potential_id, application_id, summary, criteria } = payload;

    // Validate required fields
    if ((!potential_id && !application_id) || !criteria || !Array.isArray(criteria)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload: provide potential_id or application_id and a valid criteria array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Resolve potential_id from application_id if needed
    let resolvedPotentialId = potential_id || '';
    if (!resolvedPotentialId && application_id) {
      const { data: pot, error: potError } = await supabase
        .from('potentials')
        .select('id')
        .eq('application_id', application_id)
        .maybeSingle();
      if (potError) {
        console.error('Error looking up potential by application_id:', potError);
        throw potError;
      }
      if (!pot) {
        return new Response(
          JSON.stringify({ error: 'No potential found for provided application_id' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      resolvedPotentialId = pot.id;
    }

    // Delete existing criteria scores for this potential
    const { error: deleteError } = await supabase
      .from('criteria_scores')
      .delete()
      .eq('potential_id', resolvedPotentialId);

    if (deleteError) {
      console.error('Error deleting existing scores:', deleteError);
      throw deleteError;
    }

    // Insert new criteria scores
    const criteriaScores = criteria.map(c => ({
      potential_id: resolvedPotentialId,
      criterion_id: c.criterion,
      score: c.score,
      confidence: c.confidence,
      rationale: c.rationale,
      evidence: c.evidence,
      missing_data: c.missing_data,
      raw: c.raw
    }));

    const { error: insertError } = await supabase
      .from('criteria_scores')
      .insert(criteriaScores);

    if (insertError) {
      console.error('Error inserting criteria scores:', insertError);
      throw insertError;
    }

    // Calculate average score
    const avgScore = criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length;

    // Determine status
    let status = 'evaluated';
    
    // Check if should be declined (average >= 4)
    if (avgScore >= 4) {
      status = 'declined';
    }
    // Check if needs review (low confidence or missing data)
    else if (criteria.some(c => c.confidence < 0.5 || (c.missing_data && c.missing_data !== 'None'))) {
      status = 'needs_review';
    }

    // Update potential with results
    const { error: updateError } = await supabase
      .from('potentials')
      .update({
        avg_score: avgScore,
        notes: summary,
        status: status
      })
      .eq('id', resolvedPotentialId);

    if (updateError) {
      console.error('Error updating deal:', updateError);
      throw updateError;
    }

    console.log(`Potential ${resolvedPotentialId} updated with avg_score: ${avgScore}, status: ${status}`);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        potential_id: resolvedPotentialId,
        avg_score: avgScore,
        status,
        criteria_count: criteria.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in n8n-callback function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process N8N callback', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});