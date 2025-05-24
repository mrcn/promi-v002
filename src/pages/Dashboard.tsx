import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import URLInput from '@/components/URLInput';
import ContentDisplay from '@/components/ContentDisplay';
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Hello, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <Card className="text-center py-8">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform Your Posts!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Turn any URL into engaging Instagram content. Simply paste a link below, 
                and let AI create the perfect caption for your post.
              </p>
            </CardContent>
          </Card>

          {/* URL Input */}
          {!scrapedData && <URLInput onDataScraped={handleDataScraped} />}

          {/* Content Processing */}
          {scrapedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Content & Controls */}
              <div className="space-y-6">
                <ContentDisplay 
                  data={scrapedData} 
                  selectedImageIndex={selectedImageIndex} 
                />
                
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

                {/* Reset Button */}
                <div className="text-center">
                  <Button variant="outline" onClick={resetForm}>
                    Try Another URL
                  </Button>
                </div>
              </div>

              {/* Right Column - Instagram Preview */}
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
    </div>
  );
};

export default Dashboard;