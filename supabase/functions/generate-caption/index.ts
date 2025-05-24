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
  model?: string;
  tone?: string;
  style?: string;
  audience?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Caption generation request received')
    
    const { 
      imageUrl, 
      title, 
      description, 
      content, 
      url,
      model = 'anthropic/claude-3.5-sonnet',
      tone = 'casual',
      style = 'punchy',
      audience = 'general'
    }: CaptionRequest = await req.json()
    
    console.log('Request data:', { 
      title, 
      model, 
      tone, 
      style, 
      audience,
      imageUrl: imageUrl?.substring(0, 50) + '...' 
    })
    
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

    // Build custom prompt based on user preferences
    const toneInstructions = {
      professional: 'Use a professional, polished tone suitable for business contexts.',
      casual: 'Use a friendly, conversational tone that feels natural and approachable.',
      funny: 'Use humor and wit to make the caption entertaining and shareable.',
      inspirational: 'Use motivating and uplifting language that inspires action.',
      educational: 'Use clear, informative language that teaches or explains concepts.'
    }

    const styleInstructions = {
      punchy: 'Keep it brief and impactful with short, powerful sentences.',
      detailed: 'Provide comprehensive information with thorough explanations.',
      storytelling: 'Use narrative techniques to create an engaging story.',
      question: 'Include thought-provoking questions to encourage engagement and comments.'
    }

    const audienceInstructions = {
      general: 'Appeal to a broad, diverse audience with universal themes.',
      business: 'Target professionals and industry experts with relevant insights.',
      personal: 'Write for friends and personal followers with intimate, relatable content.',
      educational: 'Focus on students and learners with clear, educational value.',
      entertainment: 'Prioritize fun, engaging content that entertains and delights.'
    }

    // Create a customized prompt
    const prompt = `Create an engaging Instagram caption for this content:

Title: ${title}
Description: ${description || 'No description available'}
Source URL: ${url}
Content Preview: ${content.substring(0, 500)}...

CUSTOMIZATION REQUIREMENTS:
- Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.casual}
- Style: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.punchy}
- Audience: ${audienceInstructions[audience as keyof typeof audienceInstructions] || audienceInstructions.general}

GENERAL REQUIREMENTS:
- Make it Instagram-friendly and engaging
- Include relevant emojis that match the tone
- Add 3-5 relevant hashtags at the end
- Keep it under 200 words unless detailed style is requested
- Make it authentic and conversational
- Focus on the key insights or interesting points from the content
- Don't mention that this is from a URL or article
- Encourage engagement based on the selected style

Generate a caption that perfectly matches the requested tone, style, and audience:`

    console.log('Using model:', model)
    console.log('Calling OpenRouter API...')

    // Call OpenRouter API with selected model
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-domain.com',
        'X-Title': 'Instagram Post Transformer'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: style === 'detailed' ? 500 : 300,
        temperature: tone === 'funny' ? 0.9 : 0.7
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
    console.log('Caption generated successfully:', { 
      length: caption.length, 
      model, 
      tone, 
      style, 
      audience 
    })

    return new Response(
      JSON.stringify({ 
        caption,
        imageUrl,
        title,
        url,
        settings: { model, tone, style, audience }
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