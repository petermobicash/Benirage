import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getContent, updateContent } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { ArrowLeft, Image, X } from 'lucide-react';
import { getUserPermissions } from '../../utils/permissions';
import Card from '../ui/Card';
import Button from '../ui/Button';
import RealTimeCollaboration from '../advanced/RealTimeCollaboration';
import AIContentSuggestions from '../advanced/AIContentSuggestions';
import ContentAnalytics from '../advanced/ContentAnalytics';
import ContentVersioning from '../advanced/ContentVersioning';
import { getThumbnailUrl } from '../../utils/cdn';
import ImageUpload from '../ui/ImageUpload';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface ContentEditorProps {
  contentId?: string;
  contentType: string;
  currentUser?: User;
  onSave: () => void;
  onCancel: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  contentId,
  contentType,
  currentUser,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Database['public']['Tables']['content']['Insert']>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: contentType,
    status: 'draft',
    author: currentUser?.email || 'Admin User',
    categories: [],
    tags: [],
    featured_image: '',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: [],
    seo_og_image: '',
    allow_comments: true,
    featured: false,
    sticky: false,
    word_count: 0,
    reading_time: 0,
    version_number: 1,
    author_id: currentUser?.id || null,
    last_edited_by_id: currentUser?.id || null,
    last_edited_by: currentUser?.email || 'Admin User',
    // Additional fields from the comprehensive schema
    gallery: [],
    initiated_by: currentUser?.email || 'Admin User',
    initiated_by_id: currentUser?.id || null,
    review_notes: '',
    published_by: '',
    published_by_id: null,
    rejected_by: '',
    rejected_by_id: null,
    rejection_reason: '',
    scheduled_for: '',
    edit_lock_expires: '',
    parent_content_id: null,
    content_template_id: null,
    reviewed_by: '',
    reviewed_by_id: null,
    reviewed_at: '',
    published_at: '',
    rejected_at: '',
    initiated_at: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaItems, setMediaItems] = useState<Array<{
    id: string;
    url: string;
    storage_path?: string;
    filename?: string;
    original_name: string;
  }>>([]);
  
  const permissions = getUserPermissions(currentUser);

  const loadMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('type', 'image/jpeg')
        .or('type.eq.image/png,type.eq.image/webp,type.eq.image/gif')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error loading media items:', error);
    }
  };

  const loadContent = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    try {
      const result = await getContent('all', 'all');

      if (result.success && result.data) {
        const content = result.data.find(item => item.id === contentId);

        if (content) {
          setFormData({
            title: content.title || '',
            slug: content.slug || '',
            content: content.content || '',
            excerpt: content.excerpt || '',
            type: content.type || contentType,
            status: content.status || 'draft',
            author: content.author || 'Admin User',
            categories: content.categories || [],
            tags: content.tags || [],
            featured_image: content.featured_image || '',
            seo_meta_title: content.seo_meta_title || '',
            seo_meta_description: content.seo_meta_description || '',
            seo_keywords: content.seo_keywords || [],
            seo_og_image: content.seo_og_image || '',
            allow_comments: content.allow_comments !== false,
            featured: content.featured || false,
            sticky: content.sticky || false,
            word_count: content.word_count || 0,
            reading_time: content.reading_time || 0,
            version_number: content.version_number || 1,
            author_id: content.author_id || currentUser?.id || null,
            last_edited_by_id: content.last_edited_by_id || currentUser?.id || null,
            last_edited_by: content.last_edited_by || currentUser?.email || 'Admin User',
            // Additional fields from the comprehensive schema
            gallery: content.gallery || [],
            initiated_by: content.initiated_by || currentUser?.email || 'Admin User',
            initiated_by_id: content.initiated_by_id || currentUser?.id || null,
            review_notes: content.review_notes || '',
            published_by: content.published_by || '',
            published_by_id: content.published_by_id || null,
            rejected_by: content.rejected_by || '',
            rejected_by_id: content.rejected_by_id || null,
            rejection_reason: content.rejection_reason || '',
            scheduled_for: content.scheduled_for || '',
            edit_lock_expires: content.edit_lock_expires || '',
            parent_content_id: content.parent_content_id || null,
            content_template_id: content.content_template_id || null,
            reviewed_by: content.reviewed_by || '',
            reviewed_by_id: content.reviewed_by_id || null,
            reviewed_at: content.reviewed_at || '',
            published_at: content.published_at || '',
            rejected_at: content.rejected_at || '',
            initiated_at: content.initiated_at || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId, currentUser, contentType]);

  useEffect(() => {
    if (contentId) {
      loadContent();
    }
    loadMediaItems();
  }, [contentId, loadContent]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[] | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleSave = async (status: string = 'draft') => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }
    
    // Check permissions for publishing
    if (status === 'published' && !permissions.canPublishContent) {
      status = 'pending_review';
      alert('Content submitted for review. You do not have permission to publish directly.');
    }

    setSaving(true);
    
    try {
      const contentData = {
        ...formData,
        status,
        updated_at: new Date().toISOString()
      };

      if (contentId) {
        // Update existing content
        const result = await updateContent(contentId, contentData);
        if (!result.success) {
          throw new Error('Failed to update content');
        }
      } else {
        // Create new content
        const { error } = await supabase
          .from('content')
          .insert([{
            ...contentData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      alert(`Content ${status === 'published' ? 'published' : 'saved'} successfully!`);
      onSave();
      
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onCancel} icon={ArrowLeft}>
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              {contentId ? 'Edit' : 'Create'} {contentType}
            </h2>
            <p className="text-gray-600">
              {contentId ? 'Update existing content' : 'Create new content for your website'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
          >
            {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            {saving ? <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div> : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSave(permissions.canPublishContent ? 'published' : 'pending_review')}
            disabled={saving}
          >
            {saving ? <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div> : (permissions.canPublishContent ? 'Publish' : 'Submit for Review')}
          </Button>
        </div>
      </div>

      {/* Advanced Features */}
      {showAdvancedFeatures && contentId && (
        <div className="space-y-6">
          <RealTimeCollaboration
            contentId={contentId}
            currentUser={currentUser || { id: '', email: '', full_name: '' }}
            onContentChange={(content) => handleInputChange('content', content)}
          />
          
          <AIContentSuggestions
            content={formData.content}
            title={formData.title}
            contentType={formData.type}
            contentId={contentId || ''}
            onApplySuggestion={(suggestion) => {
              if (suggestion.after && suggestion.before) {
                const updatedContent = formData.content.replace(suggestion.before, suggestion.after);
                handleInputChange('content', updatedContent);
              }
            }}
          />
          
          <ContentAnalytics contentId={contentId} />
          
          <ContentVersioning
            contentId={contentId}
            currentContent={formData.content}
            onRestoreVersion={(content) => handleInputChange('content', content)}
          />
        </div>
      )}
      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter content title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description for previews..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Publishing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm text-blue-900">
                  Featured content
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="comments"
                  checked={formData.allow_comments}
                  onChange={(e) => handleInputChange('allow_comments', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="comments" className="text-sm text-blue-900">
                  Allow comments
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Featured Image</h3>
            <div className="space-y-4">
              <ImageUpload
                currentImage={formData.featured_image || undefined}
                onUpload={(url) => handleInputChange('featured_image', url)}
                onRemove={() => handleInputChange('featured_image', '')}
                maxSize={10}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                uploadPath="content/featured"
                optimize={true}
                generateThumbnails={true}
                previewSize={{ width: 300, height: 200 }}
              />

              {/* Media Library Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                icon={Image}
                className="w-full"
              >
                Browse Media Library
              </Button>

              {/* Media Library Modal */}
              {showMediaLibrary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Select Featured Image</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaLibrary(false)}
                        icon={X}
                      >
                        Close
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {mediaItems.map((item) => (
                        <div
                          key={item.id}
                          className="relative group cursor-pointer"
                          onClick={() => {
                            const imagePath = item.storage_path || item.filename || '';
                            if (imagePath) {
                              handleInputChange('featured_image', getThumbnailUrl(imagePath, 'medium'));
                            }
                            setShowMediaLibrary(false);
                          }}
                        >
                          <img
                            src={getThumbnailUrl(item.storage_path || item.filename || '', 'small')}
                            alt={item.original_name}
                            className="w-full h-20 object-cover rounded border-2 border-transparent group-hover:border-blue-500"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all" />
                        </div>
                      ))}
                    </div>
                    {mediaItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No images found. Upload some images to the media library first.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo_meta_title || ''}
                  onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo_meta_description || ''}
                  onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="SEO description..."
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;