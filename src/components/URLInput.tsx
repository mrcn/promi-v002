import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkIcon, Loader2, Sparkles } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { showError, showSuccess } from '@/utils/toast';

interface ScrapedData {
  images: string[];
  title: string;
  description: string;
  content: string;
  url: string;
}

interface URLInputProps {
  onDataScraped: (data: ScrapedData) => void;
}

const URLInput = ({ onDataScraped }: URLInputProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      onDataScraped(data);
      showSuccess(`Found ${data.images.length} images from the URL!`);
      console.log('Scraped data:', data);
      
    } catch (error) {
      showError('Failed to scrape URL. Please try again.');
      console.error('URL processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Enter URL to Transform
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};

export default URLInput;