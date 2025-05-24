import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CaptionRequest {
  imageUrl: string;
  title: string;
  description: string;
  content: string;
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Caption generation request received')
    
    const { imageUrl, title, description, content, url }: CaptionRequest = await req.json()
    
    console.log('Request data:', { title, imageUrl: imageUrl?.substring(0, 50) + '...' })
    
    if (!imageUrl || !title) {
      console.error('Missing required fields:', { imageUrl: !!imageUrl, title: !!title })
      return new Response(
        JSON.stringify({ error: 'Image URL and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenRouter API key from environment
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    console.log('API key check:', { 
      hasApiKey: !!openRouterApiKey, 
      keyPrefix: openRouterApiKey?.substring(0, 10) + '...' 
    })
    
    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your Supabase Edge Function secrets.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create a prompt for Instagram caption generation
    const prompt = `Create an engaging Instagram caption for this content:

Title: ${title}
Description: ${description || 'No description available'}
Source URL: ${url}
Content Preview: ${content.substring(0, 500)}...

Requirements:
- Make it engaging and Instagram-friendly
- Include relevant emojis
- Add 3-5 relevant hashtags at the end
- Keep it under 200 words
- Make it conversational and authentic
- Focus on the key insights or interesting points from the content
- Don't mention that this is from a URL or article

Generate a caption that would make people want to engage with this post:`

    console.log('Calling OpenRouter API...')

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-domain.com',
        'X-Title': 'Instagram Post Transformer'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    console.log('OpenRouter response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', { status: response.status, error: errorData })
      return new Response(
        JSON.stringify({ 
          error: `OpenRouter API error: ${response.status}`, 
          details: errorData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    console.log('OpenRouter response received:', { hasChoices: !!data.choices })
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response structure:', data)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from OpenRouter API',
          details: 'Response structure is not as expected'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const caption = data.choices[0].message.content.trim()
    console.log('Caption generated successfully, length:', caption.length)

    return new Response(
      JSON.stringify({ 
        caption,
        imageUrl,
        title,
        url
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Caption generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate caption', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})