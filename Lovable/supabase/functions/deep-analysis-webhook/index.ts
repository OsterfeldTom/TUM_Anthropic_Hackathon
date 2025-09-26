import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeepAnalysisPayload {
  application_id: string;
  pdf_storage_path: string;
  contact_email?: string;
  research_title?: string;
  research_area?: string;
  institution?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Deep analysis webhook function called');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the request body
    const payload: DeepAnalysisPayload = await req.json();
    console.log('Received payload:', payload);

    // Validate required fields
    if (!payload.application_id || !payload.pdf_storage_path) {
      console.error('Missing required fields:', payload);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: application_id and pdf_storage_path are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get application details from database
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', payload.application_id)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch application details' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate signed URL for the PDF file
    let signedUrl = '';
    if (application.pdf_storage_path) {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('research-papers')
        .createSignedUrl(application.pdf_storage_path, 3600); // 1 hour expiry
      
      if (urlError) {
        console.error('Error generating signed URL:', urlError);
        // Continue without signed URL but log the error
      } else {
        signedUrl = urlData.signedUrl;
        console.log('Generated signed URL for PDF:', signedUrl);
      }
    }

    // Prepare payload for n8n webhook with full file URL
    const n8nPayload = {
      application_id: payload.application_id,
      pdf_storage_path: payload.pdf_storage_path,
      pdf_url_with_token: signedUrl,
      contact_email: application.contact_email,
      research_title: application.research_title,
      research_area: application.research_area,
      institution: application.institution,
      author: application.author,
      publication_date: application.publication_date,
      research_domain: application.research_domain,
      status: application.status,
      timestamp: new Date().toISOString()
    } as const;

    console.log('Sending to n8n webhook:', n8nPayload);

    // Call the n8n webhook with GET request and essential parameters
    const webhookUrl = 'https://tomosterfeld.app.n8n.cloud/webhook/5d58a52b-04f7-47c9-adc8-f79b0b8ae614';
    
    // Create URL with essential query parameters for GET request
    const urlParams = new URLSearchParams({
      application_id: payload.application_id,
      pdf_url: signedUrl || '',
      contact_email: application.contact_email || '',
      research_title: application.research_title || '',
      institution: application.institution || ''
    });
    
    const fullWebhookUrl = `${webhookUrl}?${urlParams.toString()}`;
    console.log('Calling n8n webhook URL:', fullWebhookUrl);
    
    const webhookResponse = await fetch(fullWebhookUrl, {
      method: 'GET'
    });

    console.log('n8n webhook response status:', webhookResponse.status);

    if (!webhookResponse.ok) {
      console.error('n8n webhook failed:', await webhookResponse.text());
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to trigger deep analysis workflow' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }


    console.log('Deep analysis webhook completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deep analysis started successfully',
        application_id: payload.application_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in deep analysis webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});