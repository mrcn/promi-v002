import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstagramPreviewProps {
  imageUrl: string;
  caption: string;
  username?: string;
}

type AspectRatio = 'square' | 'portrait' | 'landscape';

const InstagramPreview = ({ imageUrl, caption, username = 'your_username' }: InstagramPreviewProps) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');
  
  // Instagram caption limits
  const CAPTION_LIMIT = 2200;
  const PREVIEW_LIMIT = 125;
  
  const captionLength = caption.length;
  const isOverLimit = captionLength > CAPTION_LIMIT;
  const previewCaption = caption.length > PREVIEW_LIMIT 
    ? caption.substring(0, PREVIEW_LIMIT) + '...' 
    : caption;

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[4/5]',
    landscape: 'aspect-[1.91/1]'
  };

  const aspectRatioLabels = {
    square: '1:1 (Square)',
    portrait: '4:5 (Portrait)', 
    landscape: '1.91:1 (Landscape)'
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Instagram Preview
        </CardTitle>
        <div className="flex gap-2">
          {(Object.keys(aspectRatioClasses) as AspectRatio[]).map((ratio) => (
            <Button
              key={ratio}
              variant={aspectRatio === ratio ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAspectRatio(ratio)}
            >
              {aspectRatioLabels[ratio]}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Instagram Post Mock */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span className="font-semibold text-sm">{username}</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>

          {/* Image */}
          <div className={cn("w-full bg-gray-100 overflow-hidden", aspectRatioClasses[aspectRatio])}>
            <img
              src={imageUrl}
              alt="Instagram post"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-gray-800" />
                <MessageCircle className="w-6 h-6 text-gray-800" />
                <Send className="w-6 h-6 text-gray-800" />
              </div>
              <Bookmark className="w-6 h-6 text-gray-800" />
            </div>

            {/* Likes */}
            <div className="mb-2">
              <span className="font-semibold text-sm">1,234 likes</span>
            </div>

            {/* Caption */}
            <div className="text-sm">
              <span className="font-semibold mr-2">{username}</span>
              <span className="whitespace-pre-wrap">{previewCaption}</span>
              {caption.length > PREVIEW_LIMIT && (
                <button className="text-gray-500 ml-1">more</button>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-2">
              2 HOURS AGO
            </div>
          </div>
        </div>

        {/* Caption Stats */}
        <div className="p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Caption Length</span>
            <Badge variant={isOverLimit ? 'destructive' : captionLength > CAPTION_LIMIT * 0.9 ? 'secondary' : 'default'}>
              {captionLength} / {CAPTION_LIMIT}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Preview Length</span>
            <Badge variant={caption.length > PREVIEW_LIMIT ? 'secondary' : 'default'}>
              {Math.min(caption.length, PREVIEW_LIMIT)} chars shown
            </Badge>
          </div>

          {isOverLimit && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              ⚠️ Caption exceeds Instagram's 2,200 character limit
            </div>
          )}

          {caption.length > PREVIEW_LIMIT && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              💡 Users will need to tap "more" to see the full caption
            </div>
          )}

          <div className="text-xs text-gray-500">
            <strong>Tip:</strong> The first 125 characters are most important for engagement!
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramPreview;