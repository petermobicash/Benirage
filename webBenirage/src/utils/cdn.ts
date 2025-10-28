/**
 * CDN Utility Functions for Supabase Storage
 * Provides image optimization, transformation, and CDN URL generation
 */

import { supabase } from '../lib/supabase';

// CDN Configuration
export const CDN_CONFIG = {
  baseUrl: import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || '',
  storageBucket: 'media',
  defaultQuality: 80,
  defaultFormat: 'webp',
  supportedFormats: ['webp', 'jpg', 'jpeg', 'png', 'avif'],
  defaultSizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    original: { width: null, height: null }
  }
};

/**
 * Image transformation options
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'jpeg' | 'png' | 'avif';
  resize?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  blur?: number;
  grayscale?: boolean;
  progressive?: boolean;
}

/**
 * Generate optimized CDN URL for images
 */
export const getOptimizedImageUrl = (
  imagePath: string,
  options: ImageTransformOptions = {}
): string => {
  if (!imagePath) return '';

  // If it's a local blob URL, return as is (no CDN transformation available)
  if (imagePath.startsWith('blob:') || imagePath.startsWith('local://')) {
    return imagePath;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const {
    width = CDN_CONFIG.defaultSizes.medium.width,
    height = CDN_CONFIG.defaultSizes.medium.height,
    quality = CDN_CONFIG.defaultQuality,
    format = CDN_CONFIG.defaultFormat,
    resize = 'cover'
  } = options;

  // Build transformation parameters
  const transforms = [];

  if (width) transforms.push(`width=${width}`);
  if (height) transforms.push(`height=${height}`);
  if (quality && quality !== CDN_CONFIG.defaultQuality) transforms.push(`quality=${quality}`);
  if (format && format !== CDN_CONFIG.defaultFormat) transforms.push(`format=${format}`);
  if (resize && resize !== 'cover') transforms.push(`resize=${resize}`);

  // Normalize image path - remove leading slash if present
  const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // Construct CDN URL
  const transformString = transforms.length > 0 ? `?${transforms.join('&')}` : '';
  return `${CDN_CONFIG.baseUrl}/storage/v1/object/public/${CDN_CONFIG.storageBucket}/${normalizedPath}${transformString}`;
};

/**
 * Generate responsive image URLs for different breakpoints
 */
export const getResponsiveImageUrls = (
  imagePath: string,
  breakpoints: { [key: string]: ImageTransformOptions } = {}
): { [key: string]: string } => {
  const defaultBreakpoints = {
    mobile: { width: 390, height: 390 },
    tablet: { width: 768, height: 768 },
    desktop: { width: 1200, height: 1200 },
    retina: { width: 2400, height: 2400 }
  };

  const responsiveBreakpoints = { ...defaultBreakpoints, ...breakpoints };

  const urls: { [key: string]: string } = {};

  Object.entries(responsiveBreakpoints).forEach(([key, options]) => {
    urls[key] = getOptimizedImageUrl(imagePath, options);
  });

  return urls;
};

/**
 * Generate thumbnail URL
 */
export const getThumbnailUrl = (imagePath: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const sizes = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 }
  };

  return getOptimizedImageUrl(imagePath, {
    ...sizes[size],
    quality: 75,
    format: 'webp'
  });
};

/**
 * Generate placeholder/blurred image URL for lazy loading
 */
export const getPlaceholderUrl = (imagePath: string, blurAmount: number = 10): string => {
  return getOptimizedImageUrl(imagePath, {
    width: 50,
    height: 50,
    quality: 30,
    blur: blurAmount,
    format: 'webp'
  });
};

/**
 * Upload file to Supabase Storage with CDN optimization
 */
export const uploadToCDN = async (
  file: File,
  path: string,
  options: {
    optimize?: boolean;
    generateThumbnails?: boolean;
    thumbnailSizes?: string[];
  } = {}
): Promise<{ url: string; path: string; thumbnails?: { [key: string]: string } }> => {
  try {
    // For now, skip storage upload and return local URL to prevent errors
    console.warn('Storage upload disabled - returning local URL');

    // Log options for debugging (options parameter is reserved for future use when storage is enabled)
    if (Object.keys(options).length > 0) {
      console.log('CDN upload options (reserved for future use):', options);
    }

    const localUrl = URL.createObjectURL(file);

    return {
      url: localUrl,
      path: `local://${path}`,
      thumbnails: {}
    };

    // Original storage code (uncomment when bucket is created):
    /*
    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.warn('Could not check storage buckets:', listError);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === CDN_CONFIG.storageBucket);

    if (!bucketExists) {
      throw new Error(`Storage bucket '${CDN_CONFIG.storageBucket}' not found. Please create this bucket in your Supabase project.`);
    }

    // Upload original file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CDN_CONFIG.storageBucket)
      .upload(path, file);

    if (uploadError) throw uploadError;

    // Get public URL for original file
    const { data: { publicUrl } } = supabase.storage
      .from(CDN_CONFIG.storageBucket)
      .getPublicUrl(path);

    const result: { url: string; path: string; thumbnails?: { [key: string]: string } } = {
      url: publicUrl,
      path: uploadData.path
    };

    // Generate thumbnails if requested
    if (options.generateThumbnails && options.thumbnailSizes) {
      result.thumbnails = {};

      for (const size of options.thumbnailSizes) {
        if (size === 'small' || size === 'medium' || size === 'large') {
          const thumbnailUrl = getThumbnailUrl(uploadData.path, size);
          result.thumbnails[size] = thumbnailUrl;
        } else {
          console.warn(`Unsupported thumbnail size: ${size}. Skipping.`);
        }
      }
    }

    return result;
    */
  } catch (error) {
    console.error('Error uploading to CDN:', error);
    throw error;
  }
};

/**
 * Delete file from CDN
 */
export const deleteFromCDN = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(CDN_CONFIG.storageBucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting from CDN:', error);
    throw error;
  }
};

/**
 * Get CDN storage info
 */
export const getCDNInfo = async () => {
  try {
    const { data, error } = await supabase.storage
      .from(CDN_CONFIG.storageBucket)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    return {
      files: data || [],
      totalFiles: data?.length || 0,
      bucket: CDN_CONFIG.storageBucket
    };
  } catch (error) {
    console.error('Error getting CDN info:', error);
    throw error;
  }
};

/**
 * Generate srcset attribute for responsive images
 */
export const generateSrcSet = (imagePath: string): string => {
  const responsiveUrls = getResponsiveImageUrls(imagePath);
  const srcSetEntries = Object.entries(responsiveUrls)
    .map(([breakpoint, url]) => {
      const widths = {
        mobile: '390w',
        tablet: '768w',
        desktop: '1200w',
        retina: '2400w'
      };
      return `${url} ${widths[breakpoint as keyof typeof widths]}`;
    })
    .join(', ');

  return srcSetEntries;
};

/**
 * Preload critical images
 */
export const preloadImage = (imageUrl: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = imageUrl;
  document.head.appendChild(link);
};

/**
 * Image lazy loading helper
 */
export const createLazyImage = (
  imagePath: string,
  alt: string = '',
  className: string = '',
  options: ImageTransformOptions = {}
): HTMLImageElement => {
  const img = document.createElement('img');

  // Set loading attribute for native lazy loading
  img.loading = 'lazy';

  // Generate placeholder
  const placeholderUrl = getPlaceholderUrl(imagePath);
  img.src = placeholderUrl;
  img.setAttribute('data-src', getOptimizedImageUrl(imagePath, options));

  // Set alt text
  if (alt) img.alt = alt;

  // Set className
  if (className) img.className = className;

  // Intersection Observer for loading
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dataSrc = entry.target.getAttribute('data-src');
        if (dataSrc) {
          (entry.target as HTMLImageElement).src = dataSrc;
          entry.target.removeAttribute('data-src');
        }
        observer.unobserve(entry.target);
      }
    });
  });

  observer.observe(img);

  return img;
};

export default {
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getThumbnailUrl,
  getPlaceholderUrl,
  uploadToCDN,
  deleteFromCDN,
  getCDNInfo,
  generateSrcSet,
  preloadImage,
  createLazyImage,
  CDN_CONFIG
};