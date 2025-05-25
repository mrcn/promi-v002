import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Props {
  imageUrl: string;
  caption: string;
}

const InstagramConnect = ({ imageUrl, caption }: Props) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // check connection
    supabase
      .from("instagram_accounts")
      .select("ig_user_id")
      .eq("user_id", user?.id)
      .single()
      .then(({ data }) => {
        if (data) setConnected(true);
      });
  }, [supabase, user]);

  const handleConnect = () => {
    const token = supabase.auth.session()?.access_token;
    const state = encodeURIComponent(token!);
    const clientId = import.meta.env.VITE_INSTAGRAM_APP_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_INSTAGRAM_REDIRECT_URI);
    window.location.href = 
      `https://api.instagram.com/oauth/authorize?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=user_profile,user_media` +
      `&response_type=code&state=${state}`;
  };

  const handlePost = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("instagram-post", {
      body: { imageUrl, caption },
      headers: { Authorization: `Bearer ${supabase.auth.session()?.access_token}` },
    });
    setLoading(false);

    if (error || (data as any).error) {
      toast({ title: "Post failed", description: (error?.message || (data as any).error), variant: "destructive" });
    } else {
      toast({ title: "Posted!", description: "Successfully posted to Instagram." });
    }
  };

  if (!connected) {
    return <Button onClick={handleConnect}>Connect Instagram</Button>;
  }
  return (
    <Button onClick={handlePost} disabled={loading}>
      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Post to Instagram"}
    </Button>
  );
};

export default InstagramConnect;