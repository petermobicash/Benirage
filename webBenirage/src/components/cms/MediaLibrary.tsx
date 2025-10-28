import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Image, File, Trash2, Search, Grid, List, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { getCurrentAuthUser } from '../../utils/auth';
import {
  getOptimizedImageUrl,
  getThumbnailUrl,
  uploadToCDN,
  deleteFromCDN,
  generateSrcSet,
  CDN_CONFIG
} from '../../utils/cdn';

interface MediaItem {
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
   usage_count: number;
   storage_path?: string;
 }

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCDNSettings, setShowCDNSettings] = useState(false);
  const [cdnSettings, setCdnSettings] = useState({
    quality: 80,
    format: 'webp' as 'webp' | 'jpg' | 'png',
    enableThumbnails: true,
    enableResponsive: true
  });
  const { showToast } = useToast();

  const fetchMediaItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      showToast('Failed to load media items', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files) as File[]) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `media/${fileName}`;

        // Upload file to CDN with optimization using current settings
        const uploadResult = await uploadToCDN(file, filePath, {
          optimize: true,
          generateThumbnails: cdnSettings.enableThumbnails,
          thumbnailSizes: cdnSettings.enableThumbnails ? ['small', 'medium'] : []
        });

        // Save media record to database
        const currentUser = getCurrentAuthUser();
        const { error: dbError } = await supabase
          .from('media')
          .insert({
            filename: fileName,
            original_name: file.name,
            url: uploadResult.url,
            type: file.type,
            size: file.size,
            uploaded_by: currentUser?.email?.split('@')[0] || 'System',
            storage_path: filePath
          });

        if (dbError) throw dbError;
      }

      showToast('Files uploaded successfully with CDN optimization', 'success');
      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      // Get the storage paths for selected items before deleting from database
      const { data: itemsToDelete, error: fetchError } = await supabase
        .from('media')
        .select('id, storage_path, filename')
        .in('id', selectedItems);

      if (fetchError) throw fetchError;

      // Delete from database first
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .in('id', selectedItems);

      if (dbError) throw dbError;

      // Delete from CDN storage
      if (itemsToDelete) {
        for (const item of itemsToDelete) {
          try {
            const storagePath = item.storage_path || item.filename;
            if (storagePath) {
              await deleteFromCDN(storagePath);
            }
          } catch (cdnError) {
            console.warn(`Failed to delete ${item.filename} from CDN:`, cdnError);
            // Continue with other deletions even if one fails
          }
        }
      }

      showToast(`Deleted ${selectedItems.length} items`, 'success');
      setSelectedItems([]);
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
      showToast('Failed to delete items', 'error');
    }
  };

  const filteredItems = mediaItems.filter(item =>
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCDNSettings(!showCDNSettings)}
              className={`p-2 rounded ${showCDNSettings ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="CDN Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CDN Settings Panel */}
      {showCDNSettings && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-3">CDN Optimization Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Quality ({cdnSettings.quality}%)
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={cdnSettings.quality}
                onChange={(e) => setCdnSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Format</label>
              <select
                value={cdnSettings.format}
                onChange={(e) => setCdnSettings(prev => ({ ...prev, format: e.target.value as 'webp' | 'jpg' | 'png' }))}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="webp">WebP</option>
                <option value="jpg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cdnSettings.enableThumbnails}
                  onChange={(e) => setCdnSettings(prev => ({ ...prev, enableThumbnails: e.target.checked }))}
                  className="rounded border-green-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-green-700">Generate Thumbnails</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cdnSettings.enableResponsive}
                  onChange={(e) => setCdnSettings(prev => ({ ...prev, enableResponsive: e.target.checked }))}
                  className="rounded border-green-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-green-700">Responsive Images</span>
              </label>
            </div>
          </div>
          <div className="mt-3 text-sm text-green-600">
            <p>Current bucket: <strong>{CDN_CONFIG.storageBucket}</strong></p>
            <p>Base URL: <code className="bg-green-100 px-1 rounded">{CDN_CONFIG.baseUrl}</code></p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">Upload media files</p>
          <p className="text-gray-500">Drag and drop files here, or click to select</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          disabled={uploading}
          className="mt-4"
        />
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
            <p className="text-sm text-gray-500 mt-2">Uploading files...</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedItems.length} item(s) selected
          </span>
          <Button
            onClick={handleDeleteSelected}
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`relative group border rounded-lg overflow-hidden cursor-pointer ${
                selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                if (selectedItems.includes(item.id)) {
                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                } else {
                  setSelectedItems([...selectedItems, item.id]);
                }
              }}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {item.type.startsWith('image/') ? (
                  <img
                    src={getOptimizedImageUrl(item.storage_path || item.filename, {
                      width: 300,
                      height: 300,
                      quality: cdnSettings.quality,
                      format: cdnSettings.format
                    })}
                    srcSet={cdnSettings.enableResponsive ? generateSrcSet(item.storage_path || item.filename) : undefined}
                    sizes={cdnSettings.enableResponsive ? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" : undefined}
                    alt={item.alt || item.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <File className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {item.original_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.size)}
                </p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => {}}
                  className="rounded"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredItems.map(item => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems([...selectedItems, item.id]);
                        } else {
                          setSelectedItems(selectedItems.filter(id => id !== item.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {item.type.startsWith('image/') ? (
                          <img
                            src={getThumbnailUrl(item.storage_path || item.filename, 'small')}
                            alt={item.alt || item.original_name}
                            className="h-10 w-10 rounded object-cover"
                            loading="lazy"
                            style={{
                              filter: cdnSettings.format === 'webp' ? 'none' : undefined
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                            <File className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.original_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.filename}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(item.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.usage_count} times
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No media files found</p>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;