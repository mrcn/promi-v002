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

const Dashboard = () => {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);

  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess('Successfully logged out');
    navigate('/login');
  };

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

  const resetForm = () => {
    setScrapedData(null);
    setSelectedImageIndex(null);
    setGeneratedCaption(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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
              <div className="lg:sticky lg:top-8">
                <InstagramPreview
                  imageUrl={generatedCaption.imageUrl}
                  caption={generatedCaption.caption}
                  username={user?.email?.split('@')[0] || 'your_username'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;