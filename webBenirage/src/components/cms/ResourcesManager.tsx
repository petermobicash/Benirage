import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff, Download, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

interface Resource {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: string;
  status: string;
  author: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  featured_image?: string;
  categories: string[];
  tags: string[];
  allow_comments: boolean;
  featured: boolean;
  word_count: number;
  reading_time: number;
}

const ResourcesManager = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: 'resource',
    status: 'draft',
    featured_image: '',
    categories: [] as string[],
    tags: [] as string[],
    allow_comments: true,
    featured: false
  });
  const { showToast } = useToast();

  const resourceTypes = [
    { value: 'resource', label: 'General Resource' },
    { value: 'guide', label: 'Guide' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'document', label: 'Document' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'book', label: 'Book' },
    { value: 'article', label: 'Article' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const fetchResources = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('type', 'resource')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const calculateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadingTime = (wordCount: number) => {
    return Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words per minute
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const contentWordCount = calculateWordCount(formData.content);
      const readingTime = calculateReadingTime(contentWordCount);

      // TODO: Replace with actual user authentication
      const currentUser = 'System'; // Replace with: await getCurrentUser() or similar

      if (editingId) {
        const { error } = await supabase
          .from('content')
          .update({
            ...formData,
            slug,
            type: 'resource',
            author: currentUser,
            word_count: contentWordCount,
            reading_time: readingTime
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('Resource updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('content')
          .insert({
            ...formData,
            slug,
            type: 'resource',
            author: currentUser,
            word_count: contentWordCount,
            reading_time: readingTime
          });

        if (error) throw error;
        showToast('Resource created successfully', 'success');
      }

      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      showToast('Failed to save resource', 'error');
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      slug: resource.slug,
      content: resource.content,
      excerpt: resource.excerpt || '',
      type: resource.type,
      status: resource.status,
      featured_image: resource.featured_image || '',
      categories: resource.categories,
      tags: resource.tags,
      allow_comments: resource.allow_comments,
      featured: resource.featured
    });
    setEditingId(resource.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Resource deleted successfully', 'success');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      showToast('Failed to delete resource', 'error');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('content')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      showToast(`Resource ${newStatus}`, 'success');
      fetchResources();
    } catch (error) {
      console.error('Error updating resource status:', error);
      showToast('Failed to update resource status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      type: 'resource',
      status: 'draft',
      featured_image: '',
      categories: [],
      tags: [],
      allow_comments: true,
      featured: false
    });
    setEditingId(null);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData({ ...formData, tags });
  };

  const handleCategoriesChange = (value: string) => {
    const categories = value.split(',').map(cat => cat.trim()).filter(cat => cat !== '');
    setFormData({ ...formData, categories });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resources Manager</h1>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Resource' : 'Edit Resource'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Title"
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({ 
                    ...formData, 
                    title,
                    slug: generateSlug(title)
                  });
                }}
                required
              />

              <FormField
                label="Slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
              />

              <FormField
                label="Type"
                type="select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={resourceTypes}
              />

              <FormField
                label="Status"
                type="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={statusOptions}
              />

              <FormField
                label="Featured Image URL"
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />

              <FormField
                label="Categories (comma-separated)"
                type="text"
                value={formData.categories.join(', ')}
                onChange={(e) => handleCategoriesChange(e.target.value)}
                placeholder="spiritual, philosophy, culture"
              />

              <FormField
                label="Tags (comma-separated)"
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="meditation, wisdom, community"
              />
            </div>

            <FormField
              label="Excerpt"
              type="textarea"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Brief description of the resource..."
            />

            <FormField
              label="Content"
              type="textarea"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              required
            />

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Resource
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allow_comments"
                  checked={formData.allow_comments}
                  onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="allow_comments" className="text-sm font-medium text-gray-700">
                  Allow Comments
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => (
              <tr key={resource.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {resource.featured_image && (
                      <img
                        src={resource.featured_image}
                        alt={resource.title}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {resource.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {resource.word_count} words • {resource.reading_time} min read
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resourceTypes.find(t => t.value === resource.type)?.label || resource.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    resource.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : resource.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resource.featured ? '⭐ Featured' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(resource.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(resource)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(resource.id, resource.status)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {resource.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => window.open(`/resources/${resource.slug}`, '_blank')}
                    className="text-green-600 hover:text-green-900"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resources.length === 0 && (
        <div className="text-center py-12">
          <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No resources found</p>
          <p className="text-gray-500 mb-4">Create your first resource to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourcesManager;