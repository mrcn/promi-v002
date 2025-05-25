import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Instagram, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface InstagramPostButtonProps {
  imageUrl: string;
  caption: string;
  disabled?: boolean;
}

const InstagramPostButton: React.FC<InstagramPostButtonProps> = ({
  imageUrl,
  caption,
  disabled = false
}) => {
  const [posting, setPosting] = useState(false);
  const supabase = useSupabaseClient();

  const handlePost = async () => {
    setPosting(true);
    try {
      const { data, error } = await supabase.functions.invoke('post-to-instagram', {
        body: {
          image_url: imageUrl,
          caption: caption
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      showSuccess('Successfully posted to Instagram!');
    } catch (err) {
      console.error('Instagram post error:', err);
      showError(err instanceof Error ? err.message : 'Failed to post to Instagram');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Button
      onClick={handlePost}
      disabled={disabled || posting}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
    >
      {posting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Instagram className="h-4 w-4 mr-2" />
          Post to Instagram
        </>
      )}
    </Button>
  );
};

export default InstagramPostButton;