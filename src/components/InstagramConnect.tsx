import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, CheckCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface InstagramAccount {
  id: string;
  instagram_user_id: string;
  username: string;
  access_token: string;
  token_expires_at: string;
}

interface InstagramConnectProps {
  onAccountConnected?: (account: InstagramAccount) => void;
}

const InstagramConnect: React.FC<InstagramConnectProps> = ({ onAccountConnected }) => {
  const [connectedAccount, setConnectedAccount] = useState<InstagramAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useUser();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (user) {
      checkExistingConnection();
    }
  }, [user]);

  const checkExistingConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setConnectedAccount(data);
        onAccountConnected?.(data);
      }
    } catch {
      // No existing connection
    }
  };

  const handleConnect = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/instagram-callback`;

    if (!clientId) {
      showError('Instagram integration not configured');
      return;
    }

    const scope = 'instagram_basic,instagram_content_publish';
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code`;

    // Open OAuth in a new tab to avoid iframe CSP/cookie blocking
    const newWindow = window.open(authUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      // Fallback if popups are blocked
      window.location.href = authUrl;
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setConnectedAccount(null);
      showSuccess('Instagram account disconnected');
    } catch {
      showError('Failed to disconnect Instagram account');
    } finally {
      setLoading(false);
    }
  };

  if (connectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Instagram Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Instagram className="h-8 w-8 text-pink-500" />
              <div>
                <p className="font-medium">@{connectedAccount.username}</p>
                <p className="text-sm text-gray-500">Ready to post</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={loading}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          Connect Instagram
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Connect your Instagram Business or Creator account to post directly from here.
          </p>
          <Button onClick={handleConnect} className="flex items-center gap-2">
            <Instagram className="h-4 w-4" />
            Connect Instagram Account
          </Button>
          <p className="text-xs text-gray-500">
            A new tab will open to complete login. Make sure pop-ups are allowed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramConnect;