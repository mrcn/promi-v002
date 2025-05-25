` tags to pick up all images, including Bilgesu-3-scaled.jpg">
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedData {
  images: string[]
  title: string
  description: string
  content: string
  url: string
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

    // 1) OG and Twitter meta tags
    const metaRegex = /<meta[^>]+(?:property|name)\s*=\s*['"](og:image|twitter:image)['"][^>]*content\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = metaRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[2].trim(), url).toString())
      } catch {}
    }

    // 2) <img src>
    const imgRegex = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = imgRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
    }

    // 3) <img srcset>
    const srcsetRegex = /<img[^>]+srcset\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = srcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(',').map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString())
        } catch {}
      }
    }

    // 4) <source src>
    const sourceSrcRegex = /<source[^>]+src\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = sourceSrcRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
    }

    // 5) <source srcset>
    const sourceSrcsetRegex = /<source[^>]+srcset\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = sourceSrcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(',').map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString())
        } catch {}
      }
    }

    // 6) Lazy <img> data-src
    const dataSrcRegex = /<img[^>]+data-src\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = dataSrcRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
    }

    // 7) Lazy <img> data-srcset
    const dataSrcsetRegex = /<img[^>]+data-srcset\s*=\s*['"]([^'"]+)['"]/gi
    while ((match = dataSrcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(',').map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString())
        } catch {}
      }
    }

    // 8) CSS background-image
    const bgRegex = /background-image\s*:\s*url\((?:'|")?([^)'"]+)(?:'|")?\)/gi
    while ((match = bgRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
    }

    // 9) CSS background shorthand
    const bgShortRegex = /background\s*:\s*url\((?:'|")?([^)'"]+)(?:'|")?\)/gi
    while ((match = bgShortRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
    }

    // 10) <link> tags pointing to images
    const linkRegex = /<link[^>]+href\s*=\s*['"]([^'"]+\.(?:png|jpe?g|gif|svg))['"][^>]*>/gi
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1].trim(), url).toString())
      } catch {}
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

    const scrapedData: ScrapedData = {
      images: Array.from(imagesSet),
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