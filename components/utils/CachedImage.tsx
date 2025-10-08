import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useImageCache } from '../../hooks/ImageCacheContext';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
    blurEffect?: boolean; // Option pour activer/désactiver l'effet de flou
    directLoad?: boolean; // Option pour charger directement sans cache
}

const CachedImage: React.FC<CachedImageProps> = ({
    src,
    alt,
    fallback,
    onLoad,
    onError,
    blurEffect = true,
    directLoad = false,
    ...props
}) => {
    return (
        <img
            src={src}
            alt={alt}
            {...props}
        />
    );

    // Useless cache
    const { getCachedImage, loadImage } = useImageCache();
    const cached = getCachedImage(src);
    const [imageSrc, setImageSrc] = useState<string>(cached || '');
    const [isLoading, setIsLoading] = useState(!cached); // <-- ici
    const [hasError, setHasError] = useState(false);
    const mountedRef = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedLoadImage = useCallback((imageUrl: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (!mountedRef.current) return;

            setIsLoading(true);
            setHasError(false);

            // Utilisation de l'objet Image natif pour profiter du cache navigateur
            const img = new window.Image();
            img.onload = () => {
                if (mountedRef.current) {
                    setImageSrc(imageUrl);
                    setIsLoading(false);
                    onLoad?.();
                }
            };
            img.onerror = async () => {
                if (mountedRef.current) {
                    setIsLoading(false);
                    setHasError(true);

                    if (fallback) {
                        // Essayer de charger le fallback de la même façon
                        const fallbackImg = new window.Image();
                        fallbackImg.onload = () => {
                            if (mountedRef.current) {
                                setImageSrc(fallback);
                                setHasError(false);
                            }
                        };
                        fallbackImg.onerror = () => {
                            onError?.();
                        };
                        fallbackImg.src = fallback;
                    } else {
                        onError?.();
                    }
                }
            };
            img.src = imageUrl;
        }, 50); // Debounce de 50ms
    }, [fallback, onLoad, onError]);

    useEffect(() => {
        if (!src || src.includes('undefined')) return;

        if (directLoad) {
            setImageSrc(src);
            setIsLoading(false);
            setHasError(false);
            onLoad?.();
            return;
        }

        // Vérifier immédiatement le cache
        const cached = getCachedImage(src);
        if (cached) {
            setImageSrc(cached);
            setIsLoading(false);
            setHasError(false);
            onLoad?.();
            return;
        }

        // Sinon, charger avec debounce
        debouncedLoadImage(src);
    }, [src, getCachedImage, debouncedLoadImage, onLoad, directLoad]);

    if (!directLoad && isLoading && blurEffect && !hasError) {
        return (
            <img
                src={"/assets/System_Shop.webp"}
                alt={alt}
                {...props}
                style={{ filter: "blur(8px)", ...props.style }}
            />
        );
    }

    if (!directLoad && hasError && !fallback) {
        return (
            <div
                style={{
                    ...props.style,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                }}
                {...(props as any)}
            >
                ⚠️
            </div>
        );
    }

    // Don't render if no valid image source
    if (!imageSrc) {
        return null;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            {...props}
        />
    );
};

export default CachedImage;