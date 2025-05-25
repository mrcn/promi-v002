import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return new Response(JSON.stringify({ error: "Code or state missing" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Exchange for short‐lived token
  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: Deno.env.get("INSTAGRAM_APP_ID")!,
      client_secret: Deno.env.get("INSTAGRAM_APP_SECRET")!,
      grant_type: "authorization_code",
      redirect_uri: Deno.env.get("INSTAGRAM_REDIRECT_URI")!,
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return new Response(JSON.stringify({ error: "Failed to exchange code" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Swap for long‐lived token
  const longRes = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${Deno.env.get(
      "INSTAGRAM_APP_SECRET"
    )!}&access_token=${tokenData.access_token}`
  );
  const longData = await longRes.json();
  const accessToken = longData.access_token;
  const igUserId = String(tokenData.user_id);

  // Retrieve Supabase user from state JWT
  const { data: userData, error: userErr } = await supabase.auth.getUser(state);
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Store or update Instagram account
  await supabase
    .from("instagram_accounts")
    .upsert({ user_id: userData.user.id, ig_user_id: igUserId, access_token: accessToken });

  // Redirect back to frontend dashboard
  const frontend = Deno.env.get("INSTAGRAM_REDIRECT_URI")!;
  return new Response(null, {
    status: 302,
    headers: { Location: frontend + "/dashboard", ...corsHeaders },
  });
});