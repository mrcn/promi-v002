import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

interface ScrapedData {
  images: string[];
  title: string;
  description: string;
  content: string;
  url: string;
}

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess('Successfully logged out');
    navigate('/login');
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      showError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      showError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    console.log('Processing URL:', url);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setScrapedData(data);
      showSuccess(`Found ${data.images.length} images from the URL!`);
      console.log('Scraped data:', data);
      
    } catch (error) {
      showError('Failed to scrape URL. Please try again.');
      console.error('URL processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setScrapedData(null);
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
        <div className="max-w-4xl mx-auto space-y-8">
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

          {/* URL Input Form */}
          {!scrapedData && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Enter URL to Transform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-lg"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500">
                      Paste any article, blog post, or webpage URL to extract images and content
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6" 
                    disabled={loading || !url.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping URL...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Transform Post
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Scraped Results */}
          {scrapedData && (
            <div className="space-y-6">
              {/* Page Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Scraped Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{scrapedData.title}</h3>
                      {scrapedData.description && (
                        <p className="text-gray-600 mt-1">{scrapedData.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ImageIcon className="h-4 w-4" />
                      Found {scrapedData.images.length} images
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images Grid */}
              {scrapedData.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select an Image</CardTitle>
                    <p className="text-sm text-gray-600">Choose an image for your Instagram post</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {scrapedData.images.map((imageUrl, index) => (
                        <div 
                          key={index}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                        >
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reset Button */}
              <div className="text-center">
                <Button variant="outline" onClick={resetForm}>
                  Try Another URL
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;