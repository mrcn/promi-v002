import React, { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import URLInput from '@/components/URLInput';
import ImageSelector from '@/components/ImageSelector';
import CaptionGenerator from '@/components/CaptionGenerator';
import InstagramPreview from '@/components/InstagramPreview';
import InstagramConnect from '@/components/InstagramConnect';
import InstagramPostButton from '@/components/InstagramPostButton';

interface ScrapedData {
  images: string[];
  title: string;
  description: string;
  content: string;
  url: string;
}

interface GeneratedCaption {
  caption: string;
  imageUrl: string;
  title: string;
  url: string;
}

interface InstagramAccount {
  id: string;
  instagram_user_id: string;
  username: string;
  access_token: string;
  token_expires_at: string;
}

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);

  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleDataScraped = (data: ScrapedData) => {
    setScrapedData(data);
    setSelectedImageIndex(null);
    setGeneratedCaption(null);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setGeneratedCaption(null);
    showSuccess('Image selected! Ready to generate caption.');
  };

  const handleCaptionGenerated = (caption: GeneratedCaption) => {
    setGeneratedCaption(caption);
  };

  const handleAccountConnected = (account: InstagramAccount) => {
    setInstagramAccount(account);
  };

  const resetForm = () => {
    setScrapedData(null);
    setSelectedImageIndex(null);
    setGeneratedCaption(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Instagram Connection */}
        <div className="mb-8">
          <InstagramConnect onAccountConnected={handleAccountConnected} />
        </div>

        {/* URL Input */}
        {!scrapedData && <URLInput onDataScraped={handleDataScraped} />}

        {/* Content Processing */}
        {scrapedData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ImageSelector
                images={scrapedData.images}
                selectedIndex={selectedImageIndex}
                onImageSelect={handleImageSelect}
              />

              {selectedImageIndex !== null && (
                <CaptionGenerator
                  scrapedData={scrapedData}
                  selectedImageIndex={selectedImageIndex}
                  onCaptionGenerated={handleCaptionGenerated}
                />
              )}

              <div className="text-center">
                <Button variant="outline" onClick={resetForm}>
                  Try Another URL
                </Button>
              </div>
            </div>

            {generatedCaption && (
              <div className="lg:sticky lg:top-8 space-y-6">
                <InstagramPreview
                  imageUrl={generatedCaption.imageUrl}
                  caption={generatedCaption.caption}
                  username={instagramAccount?.username || user?.email?.split('@')[0] || 'your_username'}
                />
                
                {instagramAccount ? (
                  <InstagramPostButton
                    imageUrl={generatedCaption.imageUrl}
                    caption={generatedCaption.caption}
                  />
                ) : (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700 mb-2">Connect your Instagram account to post directly!</p>
                    <p className="text-sm text-yellow-600">Or use the prepare button to post manually.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;