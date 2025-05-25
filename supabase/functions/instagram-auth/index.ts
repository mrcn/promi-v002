import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthRequest {
  code: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, user_id }: AuthRequest = await req.json();

    if (!code || !user_id) {
      return new Response(
        JSON.stringify({ error: "Code and user_id are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = Deno.env.get("INSTAGRAM_CLIENT_ID");
    const clientSecret = Deno.env.get("INSTAGRAM_CLIENT_SECRET");
    const redirectUri = Deno.env.get("INSTAGRAM_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
      return new Response(
        JSON.stringify({ error: "Instagram credentials not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Get long-lived access token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`
    );

    if (!longLivedResponse.ok) {
      throw new Error("Failed to get long-lived token");
    }

    const longLivedData = await longLivedResponse.json();

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedData.access_token}`
    );

    if (!userResponse.ok) {
      throw new Error("Failed to get user info");
    }

    const userData = await userResponse.json();

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_accounts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_id: user_id,
        instagram_user_id: userData.id,
        username: userData.username,
        access_token: longLivedData.access_token,
        token_expires_at: new Date(Date.now() + longLivedData.expires_in * 1000).toISOString(),
      }),
    });

    if (!dbResponse.ok) {
      const dbError = await dbResponse.text();
      throw new Error(`Database error: ${dbError}`);
    }

    return new Response(
      JSON.stringify({ success: true, username: userData.username }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Instagram auth error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Authentication failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});