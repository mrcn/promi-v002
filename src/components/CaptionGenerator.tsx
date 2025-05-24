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
  
  // Customization options
  const [selectedModel, setSelectedModel] = useState('google/gemma-2-9b-it:free');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedStyle, setSelectedStyle] = useState('tips');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [prePrompt, setPrePrompt] = useState('');
  
  const supabase = useSupabaseClient();

  const handleGenerateCaption = async () => {
    setGeneratingCaption(true);
    console.log('Generating AI caption with settings:', {
      title: scrapedData.title,
      model: selectedModel,
      tone: selectedTone,
      style: selectedStyle,
      length: selectedLength,
      hasPrePrompt: !!prePrompt
    });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-caption', {
        body: {
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
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('Function returned error:', data.error);
        if (data.error.includes('OpenRouter API key')) {
          showError('Please add your OpenRouter API key to Supabase Edge Function secrets');
        } else {
          showError(`Caption generation failed: ${data.error}`);
        }
        return;
      }

      if (data.caption) {
        const caption = {
          caption: data.caption,
          imageUrl: scrapedData.images[selectedImageIndex],
          title: scrapedData.title,
          url: scrapedData.url
        };
        setGeneratedCaption(caption);
        onCaptionGenerated(caption);
        showSuccess('AI caption generated successfully! 🤖✨');
        console.log('AI-generated caption:', data.caption);
      } else {
        throw new Error('No caption received from AI');
      }
      
    } catch (error) {
      showError('Failed to generate AI caption. Check console for details.');
      console.error('AI Caption generation error:', error);
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CaptionGenerator;