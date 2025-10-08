import { useEffect } from 'react';
import { useImageCache } from '../../hooks/ImageCacheContext';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
  fallbackImages?: string[];
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({ images, priority = false, fallbackImages = ['/assets/System_Shop.webp'] }) => {
  const { preloadImages } = useImageCache();

  useEffect(() => {
    const allImages = [...images, ...fallbackImages];

    if (priority) {
      preloadImages(allImages);
    } else {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadImages(allImages);
        });
      } else {
        setTimeout(() => {
          preloadImages(allImages);
        }, 1000);
      }
    }
  }, [images, fallbackImages, priority, preloadImages]);

  return null;
};

export default ImagePreloader;

