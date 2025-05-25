import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl, caption, userId } = await req.json()

    // Admin supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Fetch stored Instagram credentials
    const { data: account, error: acctErr } = await supabase
      .from("instagram_accounts")
      .select("ig_user_id, access_token")
      .eq("user_id", userId)
      .single()

    if (acctErr || !account) {
      return new Response(JSON.stringify({ error: "Instagram account not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v17.0/${account.ig_user_id}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${account.access_token}`,
      { method: "POST" }
    )
    const containerData = await containerRes.json()
    if (!containerRes.ok || !containerData.id) {
      return new Response(JSON.stringify({ error: "Failed to create media container", details: containerData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Publish post
    const publishRes = await fetch(
      `https://graph.facebook.com/v17.0/${account.ig_user_id}/media_publish?creation_id=${containerData.id}&access_token=${account.access_token}`,
      { method: "POST" }
    )
    const publishData = await publishRes.json()
    if (!publishRes.ok || !publishData.id) {
      return new Response(JSON.stringify({ error: "Failed to publish post", details: publishData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, postId: publishData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})