import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  application_id: string;
  pdf_storage_path?: string;
  pdf_url?: string; // Full signed URL for PDF access
}

Deno.serve(async (req) => {
  console.log('Deep analysis function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Parse request body
    const { application_id, pdf_storage_path, pdf_url }: RequestBody = await req.json();
    
    if (!application_id) {
      return new Response(
        JSON.stringify({ error: 'Application ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Starting deep analysis for application: ${application_id}`);
    console.log(`PDF URL provided: ${pdf_url ? 'Yes' : 'No'}`);
    console.log(`PDF storage path: ${pdf_storage_path || 'None'}`);

    // Update application status to indicate analysis is in progress
    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
        status: 'under_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', application_id);

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update application status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Start background analysis task
    performDeepAnalysis(supabase, application_id, pdf_storage_path, pdf_url);

    console.log('Deep analysis initiated successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deep analysis initiated successfully',
        application_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in deep analysis function:', error);
    
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

async function performDeepAnalysis(supabase: any, applicationId: string, pdfStoragePath?: string, pdfUrl?: string) {
  try {
    console.log(`Performing deep analysis for application: ${applicationId}`);
    console.log(`Using PDF URL: ${pdfUrl || 'Not provided'}`);
    console.log(`Using PDF storage path: ${pdfStoragePath || 'Not provided'}`);
    
    // Fetch application details
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return;
    }

    // If we have a PDF URL, we can now access the PDF content for analysis
    if (pdfUrl) {
      console.log('PDF URL is available for analysis:', pdfUrl);
      // Here you would integrate with your PDF processing service
      // For now, we'll continue with the mock analysis
    }

    // Simulate analysis process (replace with actual analysis logic)
    console.log('Analyzing research paper content...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay for demo

    // Ensure we have a signed PDF URL (fallback if not provided)
    let effectivePdfUrl = pdfUrl;
    if (!effectivePdfUrl && pdfStoragePath) {
      try {
        const { data: signed, error: signedErr } = await supabase
          .storage
          .from('research-papers')
          .createSignedUrl(pdfStoragePath, 3600);
        if (signedErr) {
          console.error('Error creating signed URL:', signedErr);
        } else if (signed?.signedUrl) {
          effectivePdfUrl = signed.signedUrl;
          console.log('Generated signed PDF URL');
        }
      } catch (e) {
        console.error('Exception while generating signed URL:', e);
      }
    }

    // Call N8N webhook for real analysis via GET with query params
    const defaultWebhook = 'https://tomosterfeld.app.n8n.cloud/webhook-test/8bced5cf-92b0-4e4e-9df6-bfe60e3e9bb2';
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || defaultWebhook;
    const authToken = Deno.env.get('N8N_AUTH_TOKEN');

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      throw new Error('Webhook URL not configured');
    }

    const url = new URL(webhookUrl);
    url.searchParams.set('application_id', applicationId);
    if (effectivePdfUrl) url.searchParams.set('pdf_url', effectivePdfUrl);
    if (pdfStoragePath) url.searchParams.set('pdf_storage_path', pdfStoragePath);
    if (application?.research_title) url.searchParams.set('research_title', application.research_title);

    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    console.log('Calling N8N webhook (GET):', url.toString());

    const webhookResponse = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!webhookResponse.ok) {
      console.error('N8N webhook call failed:', webhookResponse.status, webhookResponse.statusText);
      throw new Error(`Webhook call failed: ${webhookResponse.status}`);
    }

    console.log('N8N webhook called successfully');
    console.log(`Deep analysis initiated for application: ${applicationId}`);

  } catch (error) {
    console.error('Error in background analysis task:', error);
    
    // Update status to indicate analysis failed
    await supabase
      .from('applications')
      .update({ 
        status: 'processed', // Or create a 'analysis_failed' status
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);
  }
}