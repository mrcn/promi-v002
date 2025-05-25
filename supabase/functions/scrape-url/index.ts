import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapedData {
  images: string[];
  title: string;
  description: string;
  content: string;
  url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const imagesSet = new Set<string>();
    let match: RegExpExecArray | null;

    // 1) OG & Twitter meta tags
    const metaRegex = /<meta[^>]+(?:property|name)=['"](og:image|twitter:image)['"][^>]*content=['"]([^'"]+)['"]/gi;
    while ((match = metaRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[2], url).toString());
      } catch {}
    }

    // 2) <img src>
    const imgSrcRegex = /<img[^>]+src=['"]([^'"]+)['"]/gi;
    while ((match = imgSrcRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // 3) <img srcset>
    const imgSrcsetRegex = /<img[^>]+srcset=['"]([^'"]+)['"]/gi;
    while ((match = imgSrcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(",").map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString());
        } catch {}
      }
    }

    // 4) <source src>
    const sourceSrcRegex = /<source[^>]+src=['"]([^'"]+)['"]/gi;
    while ((match = sourceSrcRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // 5) <source srcset>
    const sourceSrcsetRegex = /<source[^>]+srcset=['"]([^'"]+)['"]/gi;
    while ((match = sourceSrcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(",").map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString());
        } catch {}
      }
    }

    // 6) data-src
    const dataSrcRegex = /<img[^>]+data-src=['"]([^'"]+)['"]/gi;
    while ((match = dataSrcRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // 7) data-srcset
    const dataSrcsetRegex = /<img[^>]+data-srcset=['"]([^'"]+)['"]/gi;
    while ((match = dataSrcsetRegex.exec(html)) !== null) {
      for (const candidate of match[1].split(",").map(s => s.trim().split(/\s+/)[0])) {
        try {
          imagesSet.add(new URL(candidate, url).toString());
        } catch {}
      }
    }

    // 8) CSS background-image
    const bgImageRegex = /background-image\s*:\s*url\((?:["']?)([^)'"]+)(?:["']?)\)/gi;
    while ((match = bgImageRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // 9) CSS background shorthand
    const bgShorthandRegex = /background\s*:\s*url\((?:["']?)([^)'"]+)(?:["']?)\)/gi;
    while ((match = bgShorthandRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // 10) <link> tags pointing to images
    const linkRegex = /<link[^>]+href=['"]([^'"]+\.(?:png|jpe?g|gif|svg))['"][^>]*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        imagesSet.add(new URL(match[1], url).toString());
      } catch {}
    }

    // Extract title & description
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=['"]og:title['"][^>]*content=['"]([^'"]+)['"]/i);
    const title = ogTitleMatch?.[1] || titleMatch?.[1] || "Untitled";

    const descMatch = html.match(/<meta[^>]+name=['"]description['"][^>]*content=['"]([^'"]+)['"]/i);
    const ogDescMatch = html.match(/<meta[^>]+property=['"]og:description['"][^>]*content=['"]([^'"]+)['"]/i);
    const description = (ogDescMatch?.[1] || descMatch?.[1] || "").trim();

    // Clean & truncate content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const content = text.substring(0, 2000);

    const scrapedData: ScrapedData = {
      images: Array.from(imagesSet),
      title: title.trim(),
      description,
      content,
      url,
    };

    return new Response(JSON.stringify(scrapedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Scraping error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to scrape URL", details: err.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});