import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, ChevronDown, ChevronRight, Settings } from 'lucide-react';

interface CaptionCustomizerProps {
  selectedModel: string;
  selectedTone: string;
  selectedStyle: string;
  selectedLength: string;
  prePrompt: string;
  onModelChange: (model: string) => void;
  onToneChange: (tone: string) => void;
  onStyleChange: (style: string) => void;
  onLengthChange: (length: string) => void;
  onPrePromptChange: (prePrompt: string) => void;
}

const CaptionCustomizer = ({
  selectedModel,
  selectedTone,
  selectedStyle,
  selectedLength,
  prePrompt,
  onModelChange,
  onToneChange,
  onStyleChange,
  onLengthChange,
  onPrePromptChange
}: CaptionCustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const models = [
    // Free Models
    {
      id: 'google/gemma-2-9b-it:free',
      name: 'Gemma 2 9B',
      description: 'Google\'s efficient model, great for general tasks',
      icon: '🆓',
      badge: 'Free',
      category: 'free'
    },
    {
      id: 'meta-llama/llama-3.1-8b-instruct:free',
      name: 'Llama 3.1 8B',
      description: 'Meta\'s open source model, reliable and fast',
      icon: '🆓',
      badge: 'Free',
      category: 'free'
    },
    {
      id: 'microsoft/phi-3-mini-128k-instruct:free',
      name: 'Phi-3 Mini',
      description: 'Microsoft\'s compact but capable model',
      icon: '🆓',
      badge: 'Free',
      category: 'free'
    },
    {
      id: 'mistralai/mistral-7b-instruct:free',
      name: 'Mistral 7B',
      description: 'Efficient and creative, good for content',
      icon: '🆓',
      badge: 'Free',
      category: 'free'
    },
    // Premium Models
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Best overall quality, creative and engaging',
      icon: '🧠',
      badge: 'Premium',
      category: 'premium'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'Great for conversational and trendy content',
      icon: '⚡',
      badge: 'Premium',
      category: 'premium'
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fast and concise, good for quick posts',
      icon: '🚀',
      badge: 'Premium',
      category: 'premium'
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      description: 'Open source, great for authentic voice',
      icon: '🦙',
      badge: 'Premium',
      category: 'premium'
    }
  ];

  const tones = [
    { id: 'casual', name: 'Casual & Friendly', description: 'Relaxed, approachable tone' },
    { id: 'professional', name: 'Professional', description: 'Business-appropriate, polished' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
    { id: 'funny', name: 'Funny & Playful', description: 'Humorous and entertaining' },
    { id: 'educational', name: 'Educational', description: 'Informative and teaching-focused' },
    { id: 'storytelling', name: 'Storytelling', description: 'Narrative and engaging' }
  ];

  const styles = [
    { id: 'question', name: 'Question-based', description: 'Starts with engaging questions' },
    { id: 'cta', name: 'Call-to-Action', description: 'Encourages engagement and action' },
    { id: 'tips', name: 'Tips & Insights', description: 'Shares valuable takeaways' },
    { id: 'personal', name: 'Personal Story', description: 'Relates content to personal experience' },
    { id: 'facts', name: 'Facts & Stats', description: 'Highlights interesting data points' },
    { id: 'behind-scenes', name: 'Behind the Scenes', description: 'Shows process or journey' }
  ];

  const lengths = [
    { id: 'short', name: 'Short & Punchy', description: '50-100 words, quick read' },
    { id: 'medium', name: 'Medium', description: '100-150 words, balanced' },
    { id: 'long', name: 'Long & Detailed', description: '150-200 words, comprehensive' }
  ];

  const freeModels = models.filter(m => m.category === 'free');
  const premiumModels = models.filter(m => m.category === 'premium');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Customize Your Caption</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {models.find(m => m.id === selectedModel)?.name || 'Default'}
                </Badge>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 text-left">
              {isOpen ? 'Configure AI model and style preferences' : 'Click to customize AI model, tone, and style'}
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Custom Pre-prompt */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Instructions (Optional)</Label>
              <Textarea
                placeholder="Add any specific instructions, tone, or references you want the AI to include in your caption. For example: 'Write in the style of a tech entrepreneur' or 'Include references to sustainability and eco-friendly practices'"
                value={prePrompt}
                onChange={(e) => onPrePromptChange(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-gray-500">
                These instructions will be added to the AI prompt to personalize your caption
              </p>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">AI Model</Label>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {/* Free Models Section */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-green-600 bg-green-50">
                    🆓 Free Models
                  </div>
                  {freeModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-3 py-1">
                        <span className="text-lg">{model.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {model.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  
                  {/* Premium Models Section */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 mt-2">
                    ⭐ Premium Models
                  </div>
                  {premiumModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-3 py-1">
                        <span className="text-lg">{model.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              {model.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tone</Label>
              <Select value={selectedTone} onValueChange={onToneChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      <div className="py-1">
                        <div className="font-medium">{tone.name}</div>
                        <p className="text-xs text-gray-500">{tone.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Style</Label>
              <Select value={selectedStyle} onValueChange={onStyleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div className="py-1">
                        <div className="font-medium">{style.name}</div>
                        <p className="text-xs text-gray-500">{style.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Length Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Length</Label>
              <Select value={selectedLength} onValueChange={onLengthChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {lengths.map((length) => (
                    <SelectItem key={length.id} value={length.id}>
                      <div className="py-1">
                        <div className="font-medium">{length.name}</div>
                        <p className="text-xs text-gray-500">{length.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Selection Summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Current Settings:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{models.find(m => m.id === selectedModel)?.name || 'No model'}</Badge>
                <Badge variant="outline">{tones.find(t => t.id === selectedTone)?.name || 'No tone'}</Badge>
                <Badge variant="outline">{styles.find(s => s.id === selectedStyle)?.name || 'No style'}</Badge>
                <Badge variant="outline">{lengths.find(l => l.id === selectedLength)?.name || 'No length'}</Badge>
              </div>
              {prePrompt && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 font-medium">Custom Instructions:</p>
                  <p className="text-xs text-gray-500 italic">"{prePrompt.substring(0, 100)}{prePrompt.length > 100 ? '...' : ''}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CaptionCustomizer;