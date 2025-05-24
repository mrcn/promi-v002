import { useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
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
      // TODO: Add URL scraping logic here in next step
      showSuccess('URL submitted successfully! Scraping functionality coming next...');
    } catch (error) {
      showError('Failed to process URL');
      console.error('URL processing error:', error);
    } finally {
      setLoading(false);
    }
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
                      Processing URL...
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;