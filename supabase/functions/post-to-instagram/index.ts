import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostRequest {
  image_url: string;
  caption: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, caption }: PostRequest = await req.json();

    if (!image_url || !caption) {
      return new Response(
        JSON.stringify({ error: "Image URL and caption are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's Instagram account from JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract user ID from JWT (simplified - in production use proper JWT verification)
    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Get user's Instagram account
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_accounts?select=*`, {
      headers: {
        "Authorization": authHeader,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
      },
    });

    if (!accountResponse.ok) {
      throw new Error("Failed to get Instagram account");
    }

    const accounts = await accountResponse.json();
    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Instagram account connected" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const account = accounts[0];

    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/${account.instagram_user_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          image_url: image_url,
          caption: caption,
          access_token: account.access_token,
        }),
      }
    );

    if (!containerResponse.ok) {
      const errorText = await containerResponse.text();
      throw new Error(`Failed to create media container: ${errorText}`);
    }

    const containerData = await containerResponse.json();

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${account.instagram_user_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: containerData.id,
          access_token: account.access_token,
        }),
      }
    );

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      throw new Error(`Failed to publish media: ${errorText}`);
    }

    const publishData = await publishResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        post_id: publishData.id,
        message: "Successfully posted to Instagram!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Instagram post error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to post to Instagram" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});