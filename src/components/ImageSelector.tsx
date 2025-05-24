import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ImageSelectorProps {
  images: string[];
  selectedIndex: number | null;
  onImageSelect: (index: number) => void;
}

const ImageSelector = ({ images, selectedIndex, onImageSelect }: ImageSelectorProps) => {
  if (images.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select an Image</CardTitle>
        <p className="text-sm text-gray-600">Click on an image to select it for your Instagram post</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div 
              key={index}
              onClick={() => onImageSelect(index)}
              className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all relative ${
                selectedIndex === index 
                  ? 'ring-4 ring-purple-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-purple-300'
              }`}
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
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-purple-500 rounded-full p-2">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageSelector;