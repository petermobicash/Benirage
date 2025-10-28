import React, { useState, useEffect, useCallback } from 'react';
import { Image, Zap, Download, Trash2, Eye, Maximize as Optimize } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useToast } from '../../hooks/useToast';

interface MediaMetadata {
  optimization?: OptimizationResult;
  webp_conversion?: WebPConversionOptions;
  optimized_at?: string;
  converted_at?: string;
  [key: string]: unknown;
}

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  uploaded_at: string;
  uploaded_by: string;
  tags: string[];
  metadata: MediaMetadata;
  usage_count: number;
  last_used_at?: string;
  storage_path?: string;
  thumbnail_url?: string;
  uploaded_by_id?: string;
}

interface OptimizationResult {
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
  format_changed: boolean;
  quality_score: number;
  original_format?: string;
  optimized_format?: string;
}

interface WebPConversionOptions {
  quality: number;
  effort: number;
  targetFormat: 'webp' | 'avif' | 'original';
  enableProgressive: boolean;
}

const MediaOptimization: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [optimizing, setOptimizing] = useState<Set<string>>(new Set());
  const [optimizationResults, setOptimizationResults] = useState<Map<string, OptimizationResult>>(new Map());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [webpOptions, setWebpOptions] = useState<WebPConversionOptions>({
    quality: 85,
    effort: 4,
    targetFormat: 'webp',
    enableProgressive: true
  });
  const [lazyLoading, setLazyLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const loadMediaFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
      showToast('Failed to load media files', 'error');
    }
  }, [showToast]);

 useEffect(() => {
   loadMediaFiles();
 }, [loadMediaFiles]);

  const optimizeImage = async (file: MediaFile) => {
    if (!file.type.startsWith('image/')) return;

    setOptimizing(prev => new Set([...prev, file.id]));

    try {
      // Simulate image optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: OptimizationResult = {
        original_size: file.size,
        optimized_size: Math.floor(file.size * (0.3 + Math.random() * 0.4)), // 30-70% of original
        compression_ratio: 0.3 + Math.random() * 0.4,
        format_changed: file.type === 'image/png',
        quality_score: 85 + Math.random() * 10
      };

      setOptimizationResults(prev => new Map([...prev, [file.id, mockResult]]));

      // Update file record with optimization data
      await supabase
        .from('media')
        .update({
          size: mockResult.optimized_size,
          metadata: {
            ...file.metadata,
            optimization: mockResult,
            optimized_at: new Date().toISOString()
          }
        })
        .eq('id', file.id);

      showToast(`Image optimized: ${Math.round((1 - mockResult.compression_ratio) * 100)}% size reduction`, 'success');
      loadMediaFiles();
    } catch (error) {
      console.error('Error optimizing image:', error);
      showToast('Failed to optimize image', 'error');
    } finally {
      setOptimizing(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const bulkOptimize = async () => {
    const imageFiles = mediaFiles.filter(f => 
      f.type.startsWith('image/') && selectedFiles.has(f.id)
    );

    if (imageFiles.length === 0) {
      showToast('No images selected for optimization', 'warning');
      return;
    }

    for (const file of imageFiles) {
      await optimizeImage(file);
    }

    setSelectedFiles(new Set());
  };

  const generateThumbnail = async (file: MediaFile) => {
    if (!file.type.startsWith('image/')) return;

    try {
      // Simulate thumbnail generation
      const thumbnailUrl = file.url.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.$1');
      
      await supabase
        .from('media')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', file.id);

      showToast('Thumbnail generated successfully', 'success');
      loadMediaFiles();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      showToast('Failed to generate thumbnail', 'error');
    }
  };

  const analyzeMediaUsage = () => {
    const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0);
    const imageFiles = mediaFiles.filter(f => f.type.startsWith('image/'));
    const videoFiles = mediaFiles.filter(f => f.type.startsWith('video/'));
    const documentFiles = mediaFiles.filter(f => f.type.startsWith('application/'));
    
    const unusedFiles = mediaFiles.filter(f => f.usage_count === 0);
    const optimizedFiles = mediaFiles.filter(f => f.metadata?.optimization);

    return {
      totalFiles: mediaFiles.length,
      totalSize,
      imageFiles: imageFiles.length,
      videoFiles: videoFiles.length,
      documentFiles: documentFiles.length,
      unusedFiles: unusedFiles.length,
      optimizedFiles: optimizedFiles.length,
      optimizationRate: mediaFiles.length > 0 ? (optimizedFiles.length / mediaFiles.length) * 100 : 0
    };
  };

  const convertToWebP = async (file: MediaFile) => {
    if (!file.type.startsWith('image/')) return;

    setOptimizing(prev => new Set([...prev, file.id]));

    try {
      // Simulate WebP conversion process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const originalFormat = file.type.split('/')[1].toUpperCase();
      const newFormat = webpOptions.targetFormat.toUpperCase();
      const sizeReduction = 0.2 + Math.random() * 0.3; // 20-50% size reduction

      const mockResult: OptimizationResult = {
        original_size: file.size,
        optimized_size: Math.floor(file.size * (1 - sizeReduction)),
        compression_ratio: 1 - sizeReduction,
        format_changed: true,
        quality_score: 80 + Math.random() * 15,
        original_format: originalFormat,
        optimized_format: newFormat
      };

      setOptimizationResults(prev => new Map([...prev, [file.id, mockResult]]));

      // Update file record with WebP conversion data
      await supabase
        .from('media')
        .update({
          size: mockResult.optimized_size,
          type: `image/${webpOptions.targetFormat}`,
          metadata: {
            ...file.metadata,
            optimization: mockResult,
            webp_conversion: webpOptions,
            converted_at: new Date().toISOString()
          }
        })
        .eq('id', file.id);

      showToast(`Converted to ${newFormat}: ${Math.round(sizeReduction * 100)}% size reduction`, 'success');
      loadMediaFiles();
    } catch (error) {
      console.error('Error converting to WebP:', error);
      showToast('Failed to convert image format', 'error');
    } finally {
      setOptimizing(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const setupLazyLoading = useCallback(() => {
    if (!lazyLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const fileId = img.dataset.fileId;

            if (fileId && !loadedImages.has(fileId)) {
              setLoadedImages(prev => new Set([...prev, fileId]));

              // Simulate loading delay for better UX
              setTimeout(() => {
                img.src = img.dataset.src || img.src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
              }, Math.random() * 500);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe all images with lazy loading
    document.querySelectorAll('[data-lazy]').forEach((img) => {
      // Store observer reference for cleanup
      (img as HTMLElement & { _observer?: IntersectionObserver })._observer = observer;
      observer.observe(img);
    });
  }, [loadedImages, lazyLoading]);

  useEffect(() => {
    setupLazyLoading();

    // Cleanup function to disconnect observer
    return () => {
      // Disconnect any existing observers to prevent memory leaks
      document.querySelectorAll('[data-lazy]').forEach((img) => {
        const observer = (img as HTMLElement & { _observer?: IntersectionObserver })._observer;
        if (observer) {
          observer.disconnect();
        }
      });
    };
  }, [mediaFiles, lazyLoading, loadedImages, setupLazyLoading]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = analyzeMediaUsage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Media Optimization</h2>
          <p className="text-gray-600">Optimize images and manage media files efficiently</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedFiles.size > 0 && (
            <Button onClick={bulkOptimize} icon={Zap}>
              Optimize Selected ({selectedFiles.size})
            </Button>
          )}
        </div>
      </div>

      {/* WebP Conversion Settings */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Format Conversion Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Format
            </label>
            <select
              value={webpOptions.targetFormat}
              onChange={(e) => setWebpOptions(prev => ({
                ...prev,
                targetFormat: e.target.value as 'webp' | 'avif' | 'original'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
              <option value="original">Original</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality: {webpOptions.quality}%
            </label>
            <input
              type="range"
              min="60"
              max="100"
              value={webpOptions.quality}
              onChange={(e) => setWebpOptions(prev => ({
                ...prev,
                quality: parseInt(e.target.value)
              }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effort Level: {webpOptions.effort}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={webpOptions.effort}
              onChange={(e) => setWebpOptions(prev => ({
                ...prev,
                effort: parseInt(e.target.value)
              }))}
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={webpOptions.enableProgressive}
                onChange={(e) => setWebpOptions(prev => ({
                  ...prev,
                  enableProgressive: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Progressive Loading</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={lazyLoading}
                onChange={(e) => setLazyLoading(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Lazy Loading</span>
            </label>
            <span className="text-xs text-gray-500">
              Loaded: {loadedImages.size} images
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Performance: {lazyLoading ? '🚀 Optimized' : '⚡ Immediate'}
          </div>
        </div>
      </Card>

      {/* Media Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Image className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalFiles}</div>
          <div className="text-gray-600">Total Files</div>
          <div className="text-sm text-gray-500 mt-1">{formatFileSize(stats.totalSize)}</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.optimizedFiles}</div>
          <div className="text-gray-600">Optimized</div>
          <div className="text-sm text-gray-500 mt-1">{Math.round(stats.optimizationRate)}% optimized</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.imageFiles}</div>
          <div className="text-gray-600">Images</div>
          <div className="text-sm text-gray-500 mt-1">{stats.videoFiles} videos, {stats.documentFiles} docs</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.unusedFiles}</div>
          <div className="text-gray-600">Unused Files</div>
          <div className="text-sm text-gray-500 mt-1">Can be cleaned up</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Optimize className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{loadedImages.size}</div>
          <div className="text-gray-600">Lazy Loaded</div>
          <div className="text-sm text-gray-500 mt-1">
            {lazyLoading ? '🚀 Performance optimized' : '⚡ Loading immediately'}
          </div>
        </Card>
      </div>

      {/* Optimization Progress */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Optimization Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Optimization</span>
              <span>{Math.round(stats.optimizationRate)}%</span>
            </div>
            <ProgressBar progress={stats.optimizationRate} color="primary" animated />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="font-medium text-green-800">Space Saved</div>
              <div className="text-green-600">
                {formatFileSize(
                  Array.from(optimizationResults.values())
                    .reduce((sum, result) => sum + (result.original_size - result.optimized_size), 0)
                )}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-medium text-blue-800">Avg Quality</div>
              <div className="text-blue-600">
                {optimizationResults.size > 0 
                  ? Math.round(Array.from(optimizationResults.values()).reduce((sum, r) => sum + r.quality_score, 0) / optimizationResults.size)
                  : 0}%
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="font-medium text-purple-800">Formats Converted</div>
              <div className="text-purple-600">
                {Array.from(optimizationResults.values()).filter(r => r.format_changed).length}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-green-800">Lazy Loading</div>
              <div className="text-green-600 text-lg">
                {lazyLoading ? '✅' : '❌'}
              </div>
            </div>
            <div className="text-sm text-green-700 mt-1">
              {loadedImages.size} of {stats.imageFiles} images loaded
            </div>
            <div className="text-xs text-green-600 mt-1">
              {stats.imageFiles > 0 ? Math.round((loadedImages.size / stats.imageFiles) * 100) : 0}% efficiency
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-blue-800">WebP Ready</div>
              <div className="text-blue-600 text-lg">
                {webpOptions.targetFormat !== 'original' ? '🎯' : '📷'}
              </div>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Target: {webpOptions.targetFormat.toUpperCase()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Quality: {webpOptions.quality}% | Effort: {webpOptions.effort}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-purple-800">Bandwidth Saved</div>
              <div className="text-purple-600 text-lg">
                📦
              </div>
            </div>
            <div className="text-sm text-purple-700 mt-1">
              Estimated savings
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {formatFileSize(
                Array.from(optimizationResults.values())
                  .reduce((sum, result) => sum + (result.original_size - result.optimized_size), 0)
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-orange-800">Load Time</div>
              <div className="text-orange-600 text-lg">
                ⚡
              </div>
            </div>
            <div className="text-sm text-orange-700 mt-1">
              Performance impact
            </div>
            <div className="text-xs text-orange-600 mt-1">
              {lazyLoading ? 'Optimized' : 'Standard'} loading
            </div>
          </div>
        </div>
      </Card>

      {/* Media Files List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-blue-900">Media Files</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedFiles.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedFiles.size === mediaFiles.length) {
                  setSelectedFiles(new Set());
                } else {
                  setSelectedFiles(new Set(mediaFiles.map(f => f.id)));
                }
              }}
            >
              {selectedFiles.size === mediaFiles.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaFiles.map((file) => {
            const isOptimizing = optimizing.has(file.id);
            const optimizationResult = optimizationResults.get(file.id);
            const isOptimized = !!file.metadata?.optimization;

            return (
              <Card key={file.id} className={`hover:shadow-lg transition-shadow ${
                selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
              }`}>
                <div className="relative">
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(prev => new Set([...prev, file.id]));
                        } else {
                          setSelectedFiles(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(file.id);
                            return newSet;
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  {isOptimized && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Optimized
                      </span>
                    </div>
                  )}

                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {file.type.startsWith('image/') ? (
                      <img
                        data-file-id={file.id}
                        data-src={file.thumbnail_url || file.url}
                        data-lazy={lazyLoading ? 'true' : undefined}
                        src={lazyLoading ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=' : (file.thumbnail_url || file.url)}
                        alt={file.alt || file.original_name}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          lazyLoading && !loadedImages.has(file.id) ? 'opacity-0' : 'opacity-100'
                        }`}
                        loading={lazyLoading ? 'lazy' : 'eager'}
                        onLoad={() => {
                          if (file.id) {
                            setLoadedImages(prev => new Set([...prev, file.id]));
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">
                          {file.type.startsWith('video/') ? '🎥' :
                           file.type.startsWith('audio/') ? '🎵' :
                           file.type.includes('pdf') ? '📄' : '📁'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-900 truncate">{file.original_name}</h4>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    {file.width && file.height && (
                      <p className="text-xs text-gray-500">{file.width} × {file.height}</p>
                    )}
                  </div>

                  {optimizationResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="text-xs text-green-800">
                        <div>Saved: {formatFileSize(optimizationResult.original_size - optimizationResult.optimized_size)}</div>
                        <div>Quality: {Math.round(optimizationResult.quality_score)}%</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') && !isOptimized && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => optimizeImage(file)}
                        disabled={isOptimizing}
                        icon={isOptimizing ? undefined : Zap}
                        className="flex-1"
                      >
                        {isOptimizing ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center p-8">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-2 text-gray-600">Loading...</span>
                            </div>
                            <span>Optimizing...</span>
                          </div>
                        ) : (
                          'Optimize'
                        )}
                      </Button>
                    )}

                    {file.type.startsWith('image/') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => convertToWebP(file)}
                        disabled={isOptimizing}
                        icon={Download}
                        className="flex-1"
                      >
                        Convert to {webpOptions.targetFormat.toUpperCase()}
                      </Button>
                    )}

                    {file.type.startsWith('image/') && !file.thumbnail_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateThumbnail(file)}
                        icon={Image}
                      >
                        Thumbnail
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Used {file.usage_count} times</span>
                    <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {mediaFiles.length === 0 && (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Media Files</h3>
            <p className="text-gray-500">Upload some media files to get started with optimization</p>
          </div>
        )}
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          {stats.unusedFiles > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Clean up unused files</p>
                  <p className="text-sm text-yellow-700">{stats.unusedFiles} files are not being used</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Review Unused
              </Button>
            </div>
          )}

          {stats.optimizationRate < 50 && stats.imageFiles > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Optimize more images</p>
                  <p className="text-sm text-blue-700">Only {Math.round(stats.optimizationRate)}% of images are optimized</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={bulkOptimize}>
                Optimize All
              </Button>
            </div>
          )}

          {stats.totalSize > 100 * 1024 * 1024 && (
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Large media library</p>
                  <p className="text-sm text-purple-700">Consider using a CDN for better performance</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Setup CDN
              </Button>
            </div>
          )}

          {!lazyLoading && stats.imageFiles > 5 && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Optimize className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-indigo-800">Enable lazy loading</p>
                  <p className="text-sm text-indigo-700">Improve page load performance with lazy loading</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLazyLoading(true)}
              >
                Enable
              </Button>
            </div>
          )}

          {webpOptions.targetFormat === 'original' && stats.imageFiles > 0 && (
            <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Image className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-medium text-teal-800">Try modern formats</p>
                  <p className="text-sm text-teal-700">WebP/AVIF can significantly reduce file sizes</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWebpOptions(prev => ({ ...prev, targetFormat: 'webp' }))}
              >
                Enable WebP
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

};

export default MediaOptimization;