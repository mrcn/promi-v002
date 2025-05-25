import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CaptionRequest {
  imageUrl: string
  title: string
  description: string
  content: string
  url: string
  model?: string
  tone?: string
  style?: string
  length?: string
  prePrompt?: string
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

    if (!imageUrl || !title) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Image URL and title are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      console.error('❌ OpenRouter API key not found')
      return new Response(
        JSON.stringify({
          error: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your Supabase Edge Function secrets.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔑 API key found')

    // Build prompt
    let prompt = `Write an engaging Instagram caption for this content:
Title: "${title}"
Content: "${content.substring(0, 500)}..."
Requirements:
- Write ONLY the Instagram caption text
- Make it ${tone} in tone
- Use ${style} style
- Keep it ${length} length
- Include 3-5 relevant hashtags at the end
- Use emojis appropriately`

    if (prePrompt.trim()) {
      prompt += `\n- Additional instructions: ${prePrompt.trim()}`
    }
    prompt += `\n\nInstagram caption:`

    const requestBody = {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: length === 'short' ? 200 : length === 'long' ? 400 : 300,
      temperature: 0.8,
      top_p: 0.9,
    }

    console.log('📤 Sending request to OpenRouter...')
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ OpenRouter API error:', errorData)
      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status}`, details: errorData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    if (!data.choices?.[0]?.message?.content) {
      console.error('❌ Invalid OpenRouter response:', data)
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenRouter API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let caption = data.choices[0].message.content.trim()
    // strip common prefixes
    caption = caption.replace(/^(Here's|This is|Caption:)/i, '').trim()

    if (caption.length < 10) {
      console.error('❌ Caption too short:', caption)
      return new Response(
        JSON.stringify({ error: 'AI generated invalid caption', details: 'Caption too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Caption generated')
    return new Response(
      JSON.stringify({ caption, imageUrl, title, url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('💥 Caption generation error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to generate caption', details: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})