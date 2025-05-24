import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Clock, Target } from 'lucide-react';

interface CaptionCustomizerProps {
  selectedModel: string;
  selectedTone: string;
  selectedStyle: string;
  selectedLength: string;
  onModelChange: (model: string) => void;
  onToneChange: (tone: string) => void;
  onStyleChange: (style: string) => void;
  onLengthChange: (length: string) => void;
}

const CaptionCustomizer = ({
  selectedModel,
  selectedTone,
  selectedStyle,
  selectedLength,
  onModelChange,
  onToneChange,
  onStyleChange,
  onLengthChange
}: CaptionCustomizerProps) => {
  const models = [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Best overall quality, creative and engaging',
      icon: '🧠',
      badge: 'Recommended'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'Great for conversational and trendy content',
      icon: '⚡',
      badge: 'Popular'
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      description: 'Fast and concise, good for quick posts',
      icon: '🚀',
      badge: 'Fast'
    },
    {
      id: 'meta-llama/llama-3.1-70b-instruct',
      name: 'Llama 3.1 70B',
      description: 'Open source, great for authentic voice',
      icon: '🦙',
      badge: 'Open Source'
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Customize Your Caption
        </CardTitle>
        <p className="text-sm text-gray-600">
          Choose your AI model and style preferences for better results
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Model Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">AI Model</Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-lg">{model.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{model.name}</span>
                        {model.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {model.badge}
                          </Badge>
                        )}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CaptionCustomizer;