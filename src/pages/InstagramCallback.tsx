import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const InstagramCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Instagram connection...');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    if (user) {
      handleCallback();
    }
  }, [user]);

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`Instagram authorization failed: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Call edge function to exchange code for access token
      const { data, error: functionError } = await supabase.functions.invoke('instagram-auth', {
        body: { code, user_id: user.id }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStatus('success');
      setMessage('Instagram account connected successfully!');
      showSuccess('Instagram connected! You can now post directly to your account.');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Instagram callback error:', err);
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to connect Instagram account');
      showError('Failed to connect Instagram account');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Instagram Connection</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {getIcon()}
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramCallback;