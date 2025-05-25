import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { showSuccess, showError } from '@/utils/toast';
import CaptionCustomizer from './CaptionCustomizer';

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

interface CaptionGeneratorProps {
  scrapedData: ScrapedData;
  selectedImageIndex: number;
  onCaptionGenerated: (caption: GeneratedCaption) => void;
}

const CaptionGenerator = ({ scrapedData, selectedImageIndex, onCaptionGenerated }: CaptionGeneratorProps) => {
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Customization options
  const [selectedModel, setSelectedModel] = useState('google/gemma-2-9b-it:free');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedStyle, setSelectedStyle] = useState('tips');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [prePrompt, setPrePrompt] = useState('');
  
  const supabase = useSupabaseClient();

  const handleGenerateCaption = async () => {
    setGeneratingCaption(true);
    setLastError(null);
    setGeneratedCaption(null);
    console.log('🚀 Starting caption generation with settings:', {
      title: scrapedData.title,
      model: selectedModel,
      tone: selectedTone,
      style: selectedStyle,
      length: selectedLength,
      hasPrePrompt: !!prePrompt,
      imageUrl: scrapedData.images[selectedImageIndex]?.substring(0, 50) + '...'
    });
    
    try {
      console.log('📡 Calling Supabase function: generate-caption');
      
      const requestBody = {
        imageUrl: scrapedData.images[selectedImageIndex],
        title: scrapedData.title,
        description: scrapedData.description,
        content: scrapedData.content,
        url: scrapedData.url,
        model: selectedModel,
        tone: selectedTone,
        style: selectedStyle,
        length: selectedLength,
        prePrompt: prePrompt.trim()
      };
      
      console.log('📤 Request body:', requestBody);

      const response = await supabase.functions.invoke('generate-caption', {
        body: requestBody
      });

      console.log('📥 Raw Supabase response:', response);

      // Handle the response more explicitly
      const { data, error } = response;

      // If there's an error OR if data contains an error field
      if (error) {
        console.error('❌ Supabase client error:', error);
        let errorMsg = `Supabase client error: ${error.message}`;
        
        // Try to get the actual error response from data
        if (data) {
          console.log('📄 Error response data:', data);
          if (typeof data === 'object' && data.error) {
            errorMsg = `${data.error}${data.details ? ': ' + data.details : ''}`;
          } else {
            errorMsg += ` | Response data: ${JSON.stringify(data)}`;
          }
        }
        
        setLastError(errorMsg);
        showError(errorMsg);
        return;
      }

      // Check if data has an error field (edge function returned error)
      if (data && typeof data === 'object' && data.error) {
        console.error('❌ Edge function error:', data);
        const errorMsg = `${data.error}${data.details ? ': ' + data.details : ''}`;
        setLastError(errorMsg);
        showError(errorMsg);
        return;
      }

      // Success case
      if (data && data.caption) {
        console.log('✅ Caption generated successfully:', data.caption.substring(0, 100) + '...');
        const caption = {
          caption: data.caption,
          imageUrl: scrapedData.images[selectedImageIndex],
          title: scrapedData.title,
          url: scrapedData.url
        };
        setGeneratedCaption(caption);
        onCaptionGenerated(caption);
        showSuccess('✅ AI caption generated successfully! 🤖✨');
      } else {
        console.error('❌ Unexpected response format:', data);
        const errorMsg = `Unexpected response format: ${JSON.stringify(data)}`;
        setLastError(errorMsg);
        showError(errorMsg);
      }
      
    } catch (error: any) {
      console.error('❌ Caption generation error:', error);
      const errorMsg = `Failed to generate caption: ${error?.message || String(error)}`;
      setLastError(errorMsg);
      showError(errorMsg);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Caption copied to clipboard!');
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Caption Customizer */}
      <CaptionCustomizer
        selectedModel={selectedModel}
        selectedTone={selectedTone}
        selectedStyle={selectedStyle}
        selectedLength={selectedLength}
        prePrompt={prePrompt}
        onModelChange={setSelectedModel}
        onToneChange={setSelectedTone}
        onStyleChange={setSelectedStyle}
        onLengthChange={setSelectedLength}
        onPrePromptChange={setPrePrompt}
      />

      {/* Generate Caption Button */}
      {!generatedCaption && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">Perfect! You've selected your image.</p>
              <Button 
                onClick={handleGenerateCaption}
                size="lg"
                className="text-lg px-8 py-6"
                disabled={generatingCaption}
              >
                {generatingCaption ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI Generating Caption...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate AI Caption
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500">
                AI will analyze "{scrapedData.title}" and create a custom Instagram caption
              </p>
              {lastError && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-left break-all">
                  <strong>Error:</strong> {lastError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Caption */}
      {generatedCaption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Generated Instagram Caption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <Textarea
                value={generatedCaption.caption}
                readOnly
                className="min-h-[150px] resize-none border-none bg-transparent text-base"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => copyToClipboard(generatedCaption.caption)}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Caption
              </Button>
              <Button 
                onClick={handleGenerateCaption}
                variant="outline"
                disabled={generatingCaption}
              >
                {generatingCaption ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Caption
                  </>
                )}
              </Button>
            </div>
            {lastError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-left break-all">
                <strong>Error:</strong> {lastError}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CaptionGenerator;