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
  prePrompt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Caption generation request received')
    
    const { 
      imageUrl, 
      title, 
      description, 
      content, 
      url,
      model = 'google/gemma-2-9b-it:free',
      tone = 'casual',
      style = 'tips',
      length = 'medium',
      prePrompt = ''
    }: CaptionRequest = await req.json()
    
    console.log('📋 Request data:', { 
      title: title?.substring(0, 50) + '...', 
      model, 
      tone, 
      style, 
      length,
      hasPrePrompt: !!prePrompt,
      imageUrlLength: imageUrl?.length,
      contentLength: content?.length
    })
    
    if (!imageUrl || !title) {
      console.error('❌ Missing required fields:', { hasImageUrl: !!imageUrl, hasTitle: !!title })
      return new Response(
        JSON.stringify({ error: 'Image URL and title are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!openRouterApiKey) {
      console.error('❌ OpenRouter API key not found')
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

    console.log('🔑 API key found, length:', openRouterApiKey.length)

    // Build a much clearer and more direct prompt
    let prompt = `You are an expert Instagram content creator. Your job is to write engaging Instagram captions.

CONTENT TO TRANSFORM:
Title: "${title}"
Description: "${description || 'No description'}"
Content Summary: "${content.substring(0, 300)}..."

INSTRUCTIONS:
- Write ONLY an Instagram caption, nothing else
- Make it ${tone} in tone
- Use a ${style} approach
- Keep it ${length} length
- Include 3-5 relevant hashtags at the end
- Use emojis appropriately (not too many)
- Make it engaging and shareable`

    if (prePrompt && prePrompt.trim()) {
      prompt += `\n- SPECIAL INSTRUCTIONS: ${prePrompt.trim()}`
    }

    prompt += `\n\nWrite the Instagram caption now:`

    console.log('📝 Prompt created, length:', prompt.length)
    console.log('🎯 Using model:', model)

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Instagram content creator. You only write Instagram captions. You never write explanations, tutorials, or anything other than Instagram captions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: length === 'short' ? 150 : length === 'long' ? 300 : 200,
      temperature: 0.7,
      stop: ['\n\n', 'Here\'s', 'This is', 'I hope', 'Let me know']
    }

    console.log('📤 Sending request to OpenRouter...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-domain.com',
        'X-Title': 'Instagram Post Transformer'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 OpenRouter response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ OpenRouter API error:', { status: response.status, error: errorData })
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
    console.log('🔍 OpenRouter response data:', JSON.stringify(data, null, 2))
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenRouter response structure:', data)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from OpenRouter API',
          details: 'Missing choices or message in response'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let caption = data.choices[0].message.content?.trim()
    
    if (!caption) {
      console.error('❌ No content in message:', data.choices[0].message)
      return new Response(
        JSON.stringify({ 
          error: 'No caption content received from AI',
          details: 'Message content is empty'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Clean up the caption - remove any explanatory text
    caption = caption.replace(/^(Here's|This is|I hope|Let me know).*?\n/gi, '')
    caption = caption.replace(/^(Caption:|Instagram caption:)/gi, '')
    caption = caption.trim()

    console.log('✅ Caption generated successfully!')
    console.log('📝 Caption preview:', caption.substring(0, 100) + '...')
    console.log('📏 Caption length:', caption.length)

    const responseData = { 
      caption,
      imageUrl,
      title,
      url
    }

    console.log('📤 Sending response:', JSON.stringify(responseData, null, 2))

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Caption generation error:', error)
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