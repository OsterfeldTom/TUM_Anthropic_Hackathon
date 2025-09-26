import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessPaperPayload {
  file_path: string;
  application_id: string;
  test_mode?: boolean;
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

    // Parse the request body
    const { file_path, application_id, test_mode }: ProcessPaperPayload = await req.json();

    console.log('Processing research paper:', { file_path, application_id, test_mode });

    // Normalize the storage path: ensure it does NOT include the bucket prefix
    const normalizedFilePath = file_path.replace(/^research-papers\//, '').replace(/^\/+/, '');
    console.log('Normalized file path for signing:', normalizedFilePath);

    // Trigger the webhook to N8N with GET request - use test or production URL
    const webhookUrl = test_mode 
      ? 'https://tomosterfeld.app.n8n.cloud/webhook-test/5d58a52b-04f7-47c9-adc8-f79b0b8ae614' // test webhook
      : 'https://tomosterfeld.app.n8n.cloud/webhook/5d58a52b-04f7-47c9-adc8-f79b0b8ae614'; // production webhook
    
    // Create a signed URL for the private file (valid for 1 week)
    const { data: signedUrlData, error: signUrlError } = await supabase.storage
      .from('research-papers')
      .createSignedUrl(normalizedFilePath, 604800); // 7 days in seconds

    if (signUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signUrlError?.message}`);
    }

    const fileUrl = signedUrlData.signedUrl;
    
    const params = new URLSearchParams({
      // Provide both normalized and original for compatibility
      file_path: normalizedFilePath,
      original_file_path: file_path,
      bucket: 'research-papers',
      file_url: fileUrl,
      application_id,
      timestamp: new Date().toISOString(),
    });
    
    const webhookResponse = await fetch(`${webhookUrl}?${params}`, {
      method: 'GET',
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
    }

    console.log('Webhook triggered successfully');

    // Update application status to processing
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'processing' })
      .eq('id', application_id);

    if (updateError) {
      console.error('Error updating application status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Research paper processing initiated',
        webhook_triggered: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing research paper:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process research paper' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});