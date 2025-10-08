import { useEffect, useState } from 'react';
import { useClientCache } from '../../hooks/useClientCache';

interface ImageCacheProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  cacheKey?: string;
}

export default function ImageCache({ 
  src, 
  alt, 
  className = '', 
  fallback = '/assets/default-avatar.avif',
  cacheKey 
}: ImageCacheProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const cache = useClientCache();

  const key = cacheKey || `image_${src}`;

  useEffect(() => {
    
    const cachedImage = cache.getCacheData(key);
    if (cachedImage) {
      setImageSrc(cachedImage);
      setLoading(false);
      return;
    }

    
    const img = new Image();
    
    img.onload = () => {
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const base64 = canvas.toDataURL('image/webp', 0.8);
          
          cache.setCacheData(key, base64, 86400000);
          setImageSrc(base64);
        } catch (error) {
          console.error('Erreur lors de la conversion de l\'image:', error);
          setImageSrc(src);
        }
      } else {
        setImageSrc(src);
      }
      
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setImageSrc(fallback);
      setLoading(false);
    };

    img.src = src;
  }, [src, key, cache, fallback]);

  if (loading) {
    return (
      <div className={`${className} bg-glass-accent animate-pulse rounded`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-glass-border border-t-neon-blue rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!error) {
          setError(true);
          setImageSrc(fallback);
        }
      }}
    />
  );
}

