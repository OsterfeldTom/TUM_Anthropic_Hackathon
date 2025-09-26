import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, contactEmail, dealInfo } = await req.json();
    
    console.log('Starting cold call for:', { companyName, contactEmail });

    if (!companyName) {
      throw new Error('Company name is required');
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Create a personalized cold call script
    const coldCallScript = `
Hello, this is regarding ${companyName}. 

I'm calling about your recent pitch deck submission. We've completed our initial analysis and are excited about the potential we see in your ${dealInfo?.sector || 'technology'} solution.

Our investment team has reviewed your materials and we'd like to schedule a discovery call to discuss the opportunity further. We particularly found your ${dealInfo?.notes ? 'approach to' : 'business model'} very compelling.

Would you be available for a 30-minute call this week to explore how we might partner together? We believe there's strong alignment with our investment thesis, especially in the ${dealInfo?.geography || 'market'} region.

I'd love to hear more about your growth plans and discuss how our expertise in ${dealInfo?.sector || 'this sector'} could support your journey.

What's the best time to connect?
    `.trim();

    console.log('Cold call script prepared:', coldCallScript);

    // Generate speech using ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: coldCallScript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    console.log('Cold call audio generated successfully');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        script: coldCallScript,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in cold call generation:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Unknown error occurred',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});