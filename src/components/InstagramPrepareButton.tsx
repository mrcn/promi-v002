import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Instagram, Download, Copy, CheckCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface InstagramPrepareButtonProps {
  imageUrl: string;
  caption: string;
}

const InstagramPrepareButton: React.FC<InstagramPrepareButtonProps> = ({
  imageUrl,
  caption
}) => {
  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] = useState(false);

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  };

  const handlePrepareForInstagram = async () => {
    setPreparing(true);
    
    try {
      // Copy caption to clipboard
      const captionCopied = await copyToClipboard(caption);
      
      // Download image
      const imageFilename = `instagram-post-${Date.now()}.jpg`;
      const imageDownloaded = await downloadImage(imageUrl, imageFilename);
      
      if (captionCopied && imageDownloaded) {
        setPrepared(true);
        showSuccess('✅ Ready for Instagram! Caption copied & image downloaded.');
      } else if (captionCopied) {
        showSuccess('Caption copied! Please save the image manually.');
      } else if (imageDownloaded) {
        showSuccess('Image downloaded! Please copy the caption manually.');
      } else {
        showError('Please copy the caption and save the image manually.');
      }
      
    } catch (error) {
      showError('Failed to prepare content. Please copy and save manually.');
    } finally {
      setPreparing(false);
    }
  };

  const openInstagram = () => {
    // Try to open Instagram app on mobile, fallback to web
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
    
    if (isMobile) {
      // Try Instagram app first
      window.location.href = 'instagram://camera';
      // Fallback to web after a delay
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1000);
    } else {
      // Desktop - open Instagram web
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  if (prepared) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Ready for Instagram!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-600 space-y-2">
            <p>✅ Caption copied to clipboard</p>
            <p>✅ Image downloaded to your device</p>
          </div>
          
          <div className="bg-white p-4 rounded border border-green-200">
            <h4 className="font-medium text-green-700 mb-2">Next Steps:</h4>
            <ol className="text-sm text-green-600 space-y-1 list-decimal list-inside">
              <li>Open Instagram on your phone/computer</li>
              <li>Create a new post</li>
              <li>Upload the downloaded image</li>
              <li>Paste the caption (already copied!)</li>
              <li>Add any final touches and post!</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={openInstagram} className="flex-1">
              <Instagram className="h-4 w-4 mr-2" />
              Open Instagram
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(caption)}
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPrepared(false)}
            className="w-full"
          >
            Prepare Another Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handlePrepareForInstagram}
      disabled={preparing}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      size="lg"
    >
      {preparing ? (
        <>
          <Download className="h-4 w-4 mr-2 animate-pulse" />
          Preparing...
        </>
      ) : (
        <>
          <Instagram className="h-4 w-4 mr-2" />
          Prepare for Instagram
        </>
      )}
    </Button>
  );
};

export default InstagramPrepareButton;