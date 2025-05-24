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
  length?: string;
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
      style = 'tips',
      length = 'medium'
    }: CaptionRequest = await req.json()
    
    console.log('Request data:', { 
      title, 
      imageUrl: imageUrl?.substring(0, 50) + '...', 
      model, 
      tone, 
      style, 
      length 
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

    // Build tone instructions
    const toneInstructions = {
      casual: "Use a casual, friendly, and approachable tone. Write like you're talking to a friend.",
      professional: "Use a professional, polished tone suitable for business contexts.",
      inspirational: "Use an inspirational, motivating tone that uplifts and encourages.",
      funny: "Use humor and playfulness. Be entertaining and light-hearted.",
      educational: "Use an informative, teaching-focused tone that helps people learn.",
      storytelling: "Use a narrative approach that tells a compelling story."
    }

    // Build style instructions
    const styleInstructions = {
      question: "Start with engaging questions that hook the reader and encourage thinking.",
      cta: "Include clear calls-to-action that encourage engagement, comments, or shares.",
      tips: "Focus on sharing valuable tips, insights, or takeaways from the content.",
      personal: "Relate the content to personal experiences and make it relatable.",
      facts: "Highlight interesting facts, statistics, or data points from the content.",
      'behind-scenes': "Show the process, journey, or behind-the-scenes aspects."
    }

    // Build length instructions
    const lengthInstructions = {
      short: "Keep it concise and punchy (50-100 words). Get straight to the point.",
      medium: "Use a balanced approach (100-150 words). Provide good detail without being too long.",
      long: "Be comprehensive and detailed (150-200 words). Dive deep into the topic."
    }

    // Create a customized prompt based on user selections
    const basePrompt = `Create an engaging Instagram caption for this content:

Title: ${title}
Description: ${description || 'No description available'}
Source URL: ${url}
Content Preview: ${content.substring(0, 500)}...

TONE: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.casual}

STYLE: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.tips}

LENGTH: ${lengthInstructions[length as keyof typeof lengthInstructions] || lengthInstructions.medium}

Requirements:
- Make it engaging and Instagram-friendly
- Include relevant emojis (but don't overdo it)
- Add 3-5 relevant hashtags at the end
- Make it conversational and authentic
- Focus on the key insights or interesting points from the content
- Don't mention that this is from a URL or article
- Follow the tone, style, and length guidelines above

Generate a caption that would make people want to engage with this post:`

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
            content: basePrompt
          }
        ],
        max_tokens: length === 'short' ? 150 : length === 'long' ? 400 : 250,
        temperature: tone === 'funny' ? 0.9 : tone === 'professional' ? 0.5 : 0.7
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
        url,
        settings: { model, tone, style, length }
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