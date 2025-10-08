import React, { createContext, ReactNode, useCallback, useContext } from 'react';

interface ImageCacheContextType {
  getCachedImage: (src: string) => string | null;
  loadImage: (src: string) => Promise<string>;
  preloadImage: (src: string) => Promise<void>; 
  preloadImages: (srcs: string[]) => Promise<void>; 
  clearCache: () => void;
  getCacheStats: () => { cached: number; loading: number }; 
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

const imageCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

export const ImageCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getCachedImage = useCallback((src: string): string | null => {
    return imageCache.get(src) || null;
  }, []);

  const loadImage = useCallback(async (src: string): Promise<string> => {
    
    if (imageCache.has(src)) {
      return imageCache.get(src)!;
    }

    
    if (loadingPromises.has(src)) {
      return loadingPromises.get(src)!;
    }

    
    const loadingPromise = new Promise<string>(async (resolve, reject) => {
      try {
        
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        
        const blob = await response.blob();
        
        
        const blobUrl = URL.createObjectURL(blob);
        
        
        imageCache.set(src, blobUrl);
        loadingPromises.delete(src);
        
        resolve(blobUrl);
      } catch (error) {
        loadingPromises.delete(src);
        reject(error);
      }
    });

    loadingPromises.set(src, loadingPromise);
    return loadingPromise;
  }, []);

  
  const preloadImage = useCallback(async (src: string): Promise<void> => {
    try {
      await loadImage(src);
      console.log(`✅ Image préchargée: ${src}`);
    } catch (error) {
      console.warn(`❌ Échec du préchargement: ${src}`, error);
    }
  }, [loadImage]);

  
  const preloadImages = useCallback(async (srcs: string[]): Promise<void> => {
    const promises = srcs.map(src => preloadImage(src));
    await Promise.allSettled(promises); 
    console.log(`📦 Préchargement terminé pour ${srcs.length} images`);
  }, [preloadImage]);

  const getCacheStats = useCallback(() => {
    return {
      cached: imageCache.size,
      loading: loadingPromises.size
    };
  }, []);

  const clearCache = useCallback(() => {
    
    imageCache.forEach((blobUrl) => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    });
    imageCache.clear();
    loadingPromises.clear();
    console.log('🗑️ Cache d\'images vidé');
  }, []);

  return (
    <ImageCacheContext.Provider value={{ 
      getCachedImage, 
      loadImage, 
      preloadImage, 
      preloadImages, 
      clearCache,
      getCacheStats 
    }}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = (): ImageCacheContextType => {
  const context = useContext(ImageCacheContext);
  if (!context) {
    throw new Error('useImageCache must be used within an ImageCacheProvider');
  }
  return context;
};

