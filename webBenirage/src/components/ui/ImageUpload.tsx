import React, { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { uploadToCDN, getOptimizedImageUrl } from '../../utils/cdn';
import { useToast } from '../../hooks/useToast';

interface ImageUploadProps {
  onUpload: (url: string, path: string) => void;
  onRemove?: () => void;
  currentImage?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  previewSize?: { width: number; height: number };
  uploadPath?: string;
  optimize?: boolean;
  generateThumbnails?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  currentImage,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  disabled = false,
  showPreview = true,
  previewSize = { width: 200, height: 150 },
  uploadPath = 'uploads',
  optimize = true,
  generateThumbnails = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      showToast(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`, 'error');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      showToast(`File size too large. Maximum size: ${maxSize}MB`, 'error');
      return;
    }

    // Generate file path for potential local fallback
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${uploadPath}/${fileName}`;

    setUploading(true);

    try {
      const result = await uploadToCDN(file, filePath, {
        optimize,
        generateThumbnails,
        thumbnailSizes: generateThumbnails ? ['small', 'medium'] : []
      });

      onUpload(result.url, result.path);
      showToast('Image uploaded successfully', 'success');
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      const err = error as Error;

      // Provide specific error messages for common issues
      if (err?.message?.includes('Bucket not found')) {
        showToast('Storage not configured. Upload disabled until bucket is created.', 'warning');
        // For now, create a local preview without uploading
        const localUrl = URL.createObjectURL(file);
        onUpload(localUrl, `local://${filePath}`);
        showToast('Using local preview (no upload). Contact admin to enable storage.', 'info');
      } else if (err?.message?.includes('permission denied') || err?.message?.includes('unauthorized')) {
        showToast('Permission denied. Please ensure you are logged in.', 'error');
      } else {
        showToast('Failed to upload image. Please try again.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {dragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && currentImage && (
        <div className="relative">
          <img
            src={getOptimizedImageUrl(currentImage, {
              width: previewSize.width,
              height: previewSize.height,
              quality: 80,
              format: 'webp'
            })}
            alt="Preview"
            className="w-full max-w-xs rounded-lg border border-gray-200"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* CDN Info */}
      {currentImage && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p><strong>CDN Optimized:</strong> Image is served via CDN with WebP format and quality optimization</p>
          <p><strong>Original URL:</strong> <code className="bg-white px-1 rounded">{currentImage}</code></p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;