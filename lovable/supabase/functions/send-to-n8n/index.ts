import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NPayload {
  potential_id: string;
  company_name: string;
  contact_email: string;
  stage: string;
  sector: string;
  geography: string;
  ticket_size: number;
  pdf_url: string;
}

Deno.serve(async (req) => {
  console.log('N8N webhook function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    const n8nAuthToken = Deno.env.get('N8N_AUTH_TOKEN');

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'N8N webhook URL not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const payload: N8NPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    // Prepare headers for N8N request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (n8nAuthToken) {
      headers['Authorization'] = `Bearer ${n8nAuthToken}`;
    }

    // Send to N8N webhook
    console.log('Sending to N8N:', n8nWebhookUrl);
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    console.log('N8N response status:', n8nResponse.status);
    
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8N webhook failed:', errorText);
      throw new Error(`N8N webhook failed: ${n8nResponse.status} ${errorText}`);
    }

    const n8nResult = await n8nResponse.text();
    console.log('N8N response:', n8nResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully sent to N8N',
        n8n_response: n8nResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-to-n8n function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send to N8N', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});