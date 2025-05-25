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

  const jwt = req.headers.get("authorization")?.split("Bearer ")[1];
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing auth token" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // get user id
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  const body = await req.json();
  const { imageUrl, caption } = body;
  // fetch account record
  const { data: account, error: accErr } = await supabase
    .from("instagram_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (accErr || !account) {
    return new Response(JSON.stringify({ error: "No Instagram connection" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // create media object
  const mediaRes = await fetch(
    `https://graph.instagram.com/${account.ig_user_id}/media?image_url=${encodeURIComponent(
      imageUrl
    )}&caption=${encodeURIComponent(caption)}&access_token=${account.access_token}`,
    { method: "POST" }
  );
  const mediaData = await mediaRes.json();
  if (!mediaData.id) {
    return new Response(JSON.stringify({ error: "Media creation failed", details: mediaData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // publish
  const publishRes = await fetch(
    `https://graph.instagram.com/${account.ig_user_id}/media_publish?creation_id=${
      mediaData.id
    }&access_token=${account.access_token}`,
    { method: "POST" }
  );
  const publishData = await publishRes.json();
  if (!publishData.id) {
    return new Response(JSON.stringify({ error: "Publish failed", details: publishData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, postId: publishData.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});