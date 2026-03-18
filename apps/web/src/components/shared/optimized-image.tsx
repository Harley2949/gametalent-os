/**
 * 优化图片组件
 * 支持懒加载、响应式、placeholder、blur 等优化
 */

'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@gametalent/ui';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * 带懒加载的优化图片组件
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setIsError(true);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && !priority && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * 响应式图片组件
 * 根据屏幕尺寸自动选择最合适的图片
 */
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  srcSet?: {
    mobile?: string;
    tablet?: string;
    desktop: string;
  };
}

export function ResponsiveImage({
  srcSet,
  alt,
  className,
  ...props
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(srcSet?.desktop || '');

  useEffect(() => {
    if (!srcSet) return;

    const updateSrc = () => {
      const width = window.innerWidth;
      if (width < 768 && srcSet.mobile) {
        setCurrentSrc(srcSet.mobile);
      } else if (width < 1024 && srcSet.tablet) {
        setCurrentSrc(srcSet.tablet);
      } else {
        setCurrentSrc(srcSet.desktop);
      }
    };

    updateSrc();
    window.addEventListener('resize', updateSrc);
    return () => window.removeEventListener('resize', updateSrc);
  }, [srcSet]);

  return <OptimizedImage src={currentSrc} alt={alt} className={className} {...props} />;
}

/**
 * 渐进式图片加载组件
 * 先显示低质量图片，再加载高质量图片
 */
interface ProgressiveImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  width,
  height,
  className,
}: ProgressiveImageProps) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;

    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
    };
  }, [highQualitySrc]);

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn(isLoading ? 'blur-sm' : 'blur-0', 'transition-all duration-300', className)}
    />
  );
}

/**
 * 头像组件（圆形裁剪）
 */
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
  fallback,
}: AvatarProps) {
  const [isError, setIsError] = useState(false);

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const pixelSize = sizeMap[size];

  if (!src || isError) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold',
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      className={cn('rounded-full object-cover', className)}
      onError={() => setIsError(true)}
    />
  );
}

/**
 * 图片库组件（虚拟滚动）
 */
import { VirtualGrid } from './virtual-grid';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
  }>;
  onLoad?: (index: number) => void;
}

export function ImageGallery({ images, onLoad }: ImageGalleryProps) {
  return (
    <VirtualGrid
      items={images}
      renderItem={(image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="rounded-lg"
          onLoad={() => onLoad?.(index)}
        />
      )}
      itemHeight={300}
      gap={16}
    />
  );
}

/**
 * 图片懒加载 Hook
 */
export function useImageLazy() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const markAsLoaded = useCallback((src: string) => {
    setLoadedImages((prev) => new Set(prev).add(src));
  }, []);

  const isLoaded = useCallback(
    (src: string) => {
      return loadedImages.has(src);
    },
    [loadedImages]
  );

  return { markAsLoaded, isLoaded };
}
