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
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Scraping URL:', url)

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract images using regex patterns
    const imageRegex = /<img[^>]+src\s*=\s*['"](https?:\/\/[^'"]+)['"]/gi
    const ogImageRegex = /<meta[^>]+property\s*=\s*['"](og:image|twitter:image)['"]\s+content\s*=\s*['"](https?:\/\/[^'"]+)['"]/gi
    
    const images: string[] = []
    let match

    // Extract Open Graph and Twitter images (usually higher quality)
    while ((match = ogImageRegex.exec(html)) !== null) {
      if (match[2] && !images.includes(match[2])) {
        images.push(match[2])
      }
    }

    // Extract regular img tags
    while ((match = imageRegex.exec(html)) !== null) {
      if (match[1] && !images.includes(match[1])) {
        // Filter out small images, icons, and common non-content images
        const imgUrl = match[1].toLowerCase()
        if (!imgUrl.includes('icon') && 
            !imgUrl.includes('logo') && 
            !imgUrl.includes('avatar') &&
            !imgUrl.includes('button') &&
            !imgUrl.endsWith('.svg')) {
          images.push(match[1])
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
    const description = ogDescMatch?.[1] || descMatch?.[1] || ''

    // Extract main content (simplified - remove HTML tags)
    const contentMatch = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                             .replace(/<[^>]+>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim()
    
    const content = contentMatch.substring(0, 2000) // Limit content length

    const scrapedData: ScrapedData = {
      images: images.slice(0, 10), // Limit to first 10 images
      title: title.trim(),
      description: description.trim(),
      content,
      url
    }

    console.log('Scraped data:', {
      url,
      imageCount: scrapedData.images.length,
      title: scrapedData.title,
      descriptionLength: scrapedData.description.length
    })

    return new Response(
      JSON.stringify(scrapedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape URL', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})