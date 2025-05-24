import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkIcon, ImageIcon } from 'lucide-react';

interface ScrapedData {
  images: string[];
  title: string;
  description: string;
  content: string;
  url: string;
}

interface ContentDisplayProps {
  data: ScrapedData;
  selectedImageIndex: number | null;
}

const ContentDisplay = ({ data, selectedImageIndex }: ContentDisplayProps) => {
  return (
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
            <h3 className="font-semibold text-lg">{data.title}</h3>
            {data.description && (
              <p className="text-gray-600 mt-1">{data.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ImageIcon className="h-4 w-4" />
            Found {data.images.length} images
            {selectedImageIndex !== null && (
              <span className="text-green-600 font-medium">
                • Image {selectedImageIndex + 1} selected
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDisplay;