import { supabase } from '../lib/supabase';

export interface MediaUploadOptions {
  file: File;
  storyId?: string;
  type: 'audio' | 'video' | 'image';
  onProgress?: (progress: number) => void;
}

export interface MediaUploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class MediaStorageService {
  private static readonly BUCKET_NAME = 'story-media';
  private static readonly MAX_FILE_SIZES = {
    audio: 50 * 1024 * 1024, // 50MB
    video: 100 * 1024 * 1024, // 100MB
    image: 10 * 1024 * 1024   // 10MB
  };

  private static readonly ALLOWED_TYPES = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'],
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  };

  /**
    * Upload media file to Supabase storage
    */
  static async uploadMedia(options: MediaUploadOptions): Promise<MediaUploadResult> {
    const { file, storyId, type } = options;

    // Note: onProgress callback is reserved for future implementation
    // when Supabase storage API supports progress reporting

    // Validate file type
    if (!this.ALLOWED_TYPES[type].includes(file.type)) {
      throw new Error(`Invalid file type for ${type}. Allowed types: ${this.ALLOWED_TYPES[type].join(', ')}`);
    }

    // Validate file size
    const maxSize = this.MAX_FILE_SIZES[type];
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size for ${type} is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `stories/${storyId || 'temp'}/${fileName}`;

      // Upload file to storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: {
            story_id: storyId,
            original_name: file.name,
            file_type: type
          }
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: file.size,
        type: file.type
      };

    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }

  /**
   * Delete media file from storage
   */
  static async deleteMedia(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    } catch (error) {
      console.error('Media delete error:', error);
      throw error;
    }
  }

  /**
     * Get media file metadata
     */
   static async getMediaInfo(filePath: string): Promise<unknown> {
    try {
      // Extract directory path from file path
      const pathParts = filePath.split('/');
      const directoryPath = pathParts.slice(0, -1).join('/');

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(directoryPath || '', {
          search: pathParts[pathParts.length - 1] // Search for specific filename
        });

      if (error) {
        console.error('Storage list error:', error);
        throw new Error(`Failed to get file info: ${error.message}`);
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Media info error:', error);
      throw error;
    }
  }

  /**
    * Generate thumbnail for video (placeholder - would need server-side processing)
    */
   static async generateThumbnail(videoFile: File, storyId: string): Promise<string> {
     // Note: This is a placeholder implementation
     // In a real implementation, this would:
     // 1. Upload video to a video processing service
     // 2. Generate thumbnail at specific timestamp (e.g., 10% through video)
     // 3. Upload thumbnail to storage with storyId for organization
     // 4. Return thumbnail URL

     // Suppress unused parameter warnings for placeholder implementation
     console.log('Thumbnail generation placeholder - videoFile size:', videoFile.size, 'storyId:', storyId);

     // For now, return a placeholder
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve(`https://via.placeholder.com/320x180/6B7280/FFFFFF?text=Video+Thumbnail`);
       }, 1000);
     });
   }

  /**
   * Extract audio duration from file
   */
  static async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(Math.round(audio.duration));
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      });

      audio.src = url;
    });
  }

  /**
   * Extract video duration and generate thumbnail
   */
  static async getVideoMetadata(file: File): Promise<{ duration: number; thumbnail?: string }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);

        // Generate thumbnail at 10% of video duration
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          video.currentTime = Math.max(0, video.duration * 0.1);

          video.addEventListener('seeked', () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

            resolve({
              duration: Math.round(video.duration),
              thumbnail
            });
          });
        } else {
          resolve({
            duration: Math.round(video.duration)
          });
        }
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video file'));
      });

      video.src = url;
    });
  }

  /**
   * Clean up orphaned media files (older than 7 days, not referenced by stories)
   */
  static async cleanupOrphanedMedia(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_orphaned_story_media');

      if (error) {
        console.error('Cleanup error:', error);
        throw new Error(`Failed to cleanup media: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Media cleanup error:', error);
      throw error;
    }
  }

  /**
    * Get storage usage statistics
    * Note: Limited to first 1000 files due to Supabase API constraints
    */
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        throw new Error(`Failed to get storage stats: ${error.message}`);
      }

      const files = data || [];
      const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

      const filesByType = files.reduce((acc, file) => {
        const type = file.metadata?.file_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalFiles: files.length,
        totalSize,
        filesByType
      };
    } catch (error) {
      console.error('Storage stats error:', error);
      throw error;
    }
  }
}

export default MediaStorageService;