import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Potential {
  id: string;
  application_id: string;
  progress_stage: number;
  avg_score: number;
  status: string;
  notes: string;
  created_at: string;
  overall_confindence: string;
}

interface CriteriaScore {
  criterion: string;
  score: number;
  confidence: number;
  rationale: string;
  evidence: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch potentials data
    const { data: potentials, error: potentialsError } = await supabase
      .from('potentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (potentialsError) {
      console.error('Error fetching potentials:', potentialsError);
      throw new Error('Failed to fetch potentials data');
    }

    // Fetch criteria scores
    const { data: criteriaScores, error: criteriaError } = await supabase
      .from('criteria_scores')
      .select('*');

    if (criteriaError) {
      console.error('Error fetching criteria scores:', criteriaError);
    }

    // Prepare context data
    const contextData = {
      totalPotentials: potentials?.length || 0,
      potentials: potentials?.map((potential: Potential) => ({
        id: potential.id,
        applicationId: potential.application_id,
        progressStage: potential.progress_stage,
        avgScore: potential.avg_score,
        status: potential.status,
        notes: potential.notes,
        createdAt: potential.created_at,
        overallConfidence: potential.overall_confindence
      })) || [],
      criteriaScores: criteriaScores?.reduce((acc: any, score: CriteriaScore) => {
        if (!acc[score.criterion]) {
          acc[score.criterion] = [];
        }
        acc[score.criterion].push({
          score: score.score,
          confidence: score.confidence,
          rationale: score.rationale,
          evidence: score.evidence
        });
        return acc;
      }, {}) || {}
    };

    // Prepare conversation messages for OpenAI
    const systemPrompt = `You are an AI investment analyst assistant with access to a venture capital potentials database. You can help users analyze investment potentials, get insights about research applications, and answer questions about their investment pipeline.

Current Database Context:
- Total potentials: ${contextData.totalPotentials}
- Available statuses: ${[...new Set(potentials?.map((p: Potential) => p.status).filter(Boolean))].join(', ')}
- Available progress stages: ${[...new Set(potentials?.map((p: Potential) => p.progress_stage).filter(p => p !== null))].join(', ')}

When answering questions:
1. Reference specific potentials and data when relevant
2. Provide actionable insights based on the data
3. Use numbers and statistics to support your analysis
4. Suggest follow-up actions when appropriate
5. Be concise but informative

Available data includes potential information like application IDs, progress stages, average scores, status, notes, and detailed criteria scoring.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { 
        role: "user", 
        content: `${message}\n\nContext Data: ${JSON.stringify(contextData, null, 2)}` 
      }
    ];

    // Call Claude API
    const claudeMessages = messages.filter(msg => msg.role !== 'system').map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: [{ type: 'text', text: String(msg.content) }]
    }));

    console.log('Calling Claude API with messages:', claudeMessages.length);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: claudeMessages,
        system: systemPrompt
      }),
    });

    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Failed to get response from Claude: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Claude API response:', data);
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-with-deals function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      response: 'Sorry, I encountered an error while processing your request. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});