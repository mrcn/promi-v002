import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Test function called successfully!')
    
    const requestData = await req.json()
    console.log('Received data:', requestData)

    // Simple test response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Edge function is working!',
        caption: 'This is a test caption! 🎉 Your edge functions are working perfectly. #test #success #working',
        receivedData: requestData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Test function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Test function failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})