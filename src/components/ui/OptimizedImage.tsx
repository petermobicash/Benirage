import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  fallback?: string;
  quality?: number;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  width,
  height,
  fallback = '/images/placeholder.jpg',
  quality = 85,
  sizes = '100vw'
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(loading === 'eager');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading !== 'lazy') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before the image comes into view
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Generate optimized image URL (WebP format with quality)
  const generateOptimizedUrl = (originalSrc: string): string => {
    // If it's already an optimized URL, return as is
    if (originalSrc.includes('optimize') || originalSrc.includes('webp')) {
      return originalSrc;
    }

    // For external URLs, return as is (assuming they're already optimized)
    if (originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, we would integrate with an image optimization service
    // For now, return the original src
    return originalSrc;
  };

  useEffect(() => {
    if (inView) {
      const optimizedSrc = generateOptimizedUrl(src);
      setImageSrc(optimizedSrc);
    }
  }, [inView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (baseSrc: string): string => {
    if (baseSrc.startsWith('http')) {
      return baseSrc; // For external images, use the same URL
    }
    
    // For local images, generate different sizes
    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality}&f=webp ${size}w`)
      .join(', ');
  };

  const finalSrcSet = imageSrc ? generateSrcSet(imageSrc) : undefined;

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 text-gray-400">📷</div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          srcSet={finalSrcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading={loading}
          decoding="async"
        />
      )}

      {/* Progressive enhancement overlay */}
      {isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default OptimizedImage;