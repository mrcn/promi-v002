import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, MessageSquare } from 'lucide-react';

export interface CaptionSettings {
  model: string;
  tone: string;
  style: string;
  audience: string;
}

interface CaptionCustomizerProps {
  settings: CaptionSettings;
  onSettingsChange: (settings: CaptionSettings) => void;
}

const CaptionCustomizer = ({ settings, onSettingsChange }: CaptionCustomizerProps) => {
  const updateSetting = (key: keyof CaptionSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const models = [
    { 
      id: 'anthropic/claude-3.5-sonnet', 
      name: 'Claude 3.5 Sonnet', 
      description: 'Best overall quality',
      badge: 'Recommended'
    },
    { 
      id: 'openai/gpt-4o', 
      name: 'GPT-4o', 
      description: 'Creative and engaging',
      badge: 'Popular'
    },
    { 
      id: 'openai/gpt-4o-mini', 
      name: 'GPT-4o Mini', 
      description: 'Fast and efficient',
      badge: 'Fast'
    },
    { 
      id: 'meta-llama/llama-3.1-70b-instruct', 
      name: 'Llama 3.1 70B', 
      description: 'Open source alternative',
      badge: 'Open Source'
    }
  ];

  const tones = [
    { id: 'professional', name: 'Professional', description: 'Polished and business-like' },
    { id: 'casual', name: 'Casual', description: 'Friendly and conversational' },
    { id: 'funny', name: 'Funny', description: 'Humorous and entertaining' },
    { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
    { id: 'educational', name: 'Educational', description: 'Informative and teaching' }
  ];

  const styles = [
    { id: 'punchy', name: 'Short & Punchy', description: 'Brief and impactful' },
    { id: 'detailed', name: 'Detailed', description: 'Comprehensive and thorough' },
    { id: 'storytelling', name: 'Storytelling', description: 'Narrative and engaging' },
    { id: 'question', name: 'Question-based', description: 'Encourages engagement' }
  ];

  const audiences = [
    { id: 'general', name: 'General Audience', description: 'Broad appeal' },
    { id: 'business', name: 'Business/Professional', description: 'Industry professionals' },
    { id: 'personal', name: 'Personal/Lifestyle', description: 'Friends and followers' },
    { id: 'educational', name: 'Students/Learners', description: 'Educational content' },
    { id: 'entertainment', name: 'Entertainment', description: 'Fun and engaging' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Customize AI Generation
        </CardTitle>
        <p className="text-sm text-gray-600">
          Fine-tune your caption generation with different models and styles
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Model Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Model
          </Label>
          <Select value={settings.model} onValueChange={(value) => updateSetting('model', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {model.badge}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tone Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Tone
          </Label>
          <Select value={settings.tone} onValueChange={(value) => updateSetting('tone', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  <div>
                    <div className="font-medium">{tone.name}</div>
                    <div className="text-xs text-gray-500">{tone.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Style
          </Label>
          <Select value={settings.style} onValueChange={(value) => updateSetting('style', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {styles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Audience Selection */}
        <div className="space-y-3">
          <Label>Target Audience</Label>
          <Select value={settings.audience} onValueChange={(value) => updateSetting('audience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              {audiences.map((audience) => (
                <SelectItem key={audience.id} value={audience.id}>
                  <div>
                    <div className="font-medium">{audience.name}</div>
                    <div className="text-xs text-gray-500">{audience.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium mb-2">Current Settings:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{models.find(m => m.id === settings.model)?.name}</Badge>
            <Badge variant="outline">{tones.find(t => t.id === settings.tone)?.name}</Badge>
            <Badge variant="outline">{styles.find(s => s.id === settings.style)?.name}</Badge>
            <Badge variant="outline">{audiences.find(a => a.id === settings.audience)?.name}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaptionCustomizer;