import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedData {
  images: string[];
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
    const { url } = await req.json()
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the webpage HTML
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }
    const html = await response.text()

    // Use a Set to dedupe
    const imagesSet = new Set<string>()
    let match: RegExpExecArray | null

    // 1) OG and Twitter meta tags (property or name)
    const metaRegex = /<meta[^>]+(?:property|name)\s*=\s*['"](og:image|twitter:image)['"][^>]*content\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = metaRegex.exec(html)) !== null) {
      const src = match[2].trim()
      try {
        imagesSet.add(new URL(src, url).toString())
      } catch {
        // skip invalid
      }
    }

    // 2) Standard <img> tags with src
    const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1].trim()
      try {
        imagesSet.add(new URL(src, url).toString())
      } catch {
        // skip invalid
      }
    }

    // 3) Handle srcset attributes for additional resolutions
    const srcsetRegex = /<img[^>]+srcset\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = srcsetRegex.exec(html)) !== null) {
      const parts = match[1].split(',').map(s => s.trim().split(/\s+/)[0])
      for (const candidate of parts) {
        try {
          imagesSet.add(new URL(candidate, url).toString())
        } catch {
          // skip invalid
        }
      }
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const ogTitleMatch = html.match(/<meta[^>]+property\s*=\s*['"]og:title['"][^>]+content\s*=\s*['"]([^'"]+)['"]/i)
    const title = ogTitleMatch?.[1] || titleMatch?.[1] || 'Untitled'

    // Extract description
    const descMatch = html.match(/<meta[^>]+name\s*=\s*['"]description['"][^>]+content\s*=\s*['"]([^'"]+)['"]/i)
    const ogDescMatch = html.match(/<meta[^>]+property\s*=\s*['"]og:description['"][^>]+content\s*=\s*['"]([^'"]+)['"]/i)
    const description = (ogDescMatch?.[1] || descMatch?.[1] || '').trim()

    // Clean and truncate main content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const content = text.substring(0, 2000)

    // Build final array
    const images = Array.from(imagesSet)

    const scrapedData: ScrapedData = {
      images,
      title: title.trim(),
      description,
      content,
      url
    }

    return new Response(
      JSON.stringify(scrapedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to scrape URL', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})