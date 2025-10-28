import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

interface PageContent {
  id: string;
  page_id: string;
  section_id: string;
  title: string;
  content: string;
  image_url?: string;
  order_index: number;
  is_active: boolean;
  updated_at: string;
  updated_by: string;
}

const PageContentManager = () => {
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    page_id: '',
    section_id: '',
    title: '',
    content: '',
    image_url: '',
    order_index: 0,
    is_active: true
  });
  const { showToast } = useToast();

  const pages = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'spiritual', name: 'Spiritual' },
    { id: 'philosophy', name: 'Philosophy' },
    { id: 'culture', name: 'Culture' },
    { id: 'programs', name: 'Programs' },
    { id: 'get-involved', name: 'Get Involved' }
  ];

  const fetchPageContents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .order('page_id', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPageContents(data || []);
    } catch (error) {
      console.error('Error fetching page contents:', error);
      showToast('Failed to load page contents', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPageContents();
  }, [fetchPageContents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('page_content')
          .update({
            ...formData,
            updated_by: 'Current User' // Replace with actual user
          })
          .eq('id', editingId);

        if (error) throw error;
        showToast('Page content updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('page_content')
          .insert({
            ...formData,
            updated_by: 'Current User' // Replace with actual user
          });

        if (error) throw error;
        showToast('Page content created successfully', 'success');
      }

      resetForm();
      fetchPageContents();
    } catch (error) {
      console.error('Error saving page content:', error);
      showToast('Failed to save page content', 'error');
    }
  };

  const handleEdit = (content: PageContent) => {
    setFormData({
      page_id: content.page_id,
      section_id: content.section_id,
      title: content.title,
      content: content.content,
      image_url: content.image_url || '',
      order_index: content.order_index,
      is_active: content.is_active
    });
    setEditingId(content.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page content?')) return;

    try {
      const { error } = await supabase
        .from('page_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Page content deleted successfully', 'success');
      fetchPageContents();
    } catch (error) {
      console.error('Error deleting page content:', error);
      showToast('Failed to delete page content', 'error');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('page_content')
        .update({ 
          is_active: !isActive,
          updated_by: 'Current User' // Replace with actual user
        })
        .eq('id', id);

      if (error) throw error;
      showToast(`Page content ${!isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchPageContents();
    } catch (error) {
      console.error('Error toggling page content status:', error);
      showToast('Failed to update page content status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      page_id: '',
      section_id: '',
      title: '',
      content: '',
      image_url: '',
      order_index: 0,
      is_active: true
    });
    setEditingId(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Page Content Manager</h1>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Content' : 'Edit Content'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Page"
                type="select"
                value={formData.page_id}
                onChange={(value) => setFormData({ ...formData, page_id: value })}
                required
                options={pages.map(page => ({ value: page.id, label: page.name }))}
              />

              <FormField
                label="Section ID"
                type="text"
                value={formData.section_id}
                onChange={(value) => setFormData({ ...formData, section_id: value })}
                placeholder="e.g., hero, about, features"
                required
              />

              <FormField
                label="Title"
                type="text"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                required
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index}
                onChange={(value) => setFormData({ ...formData, order_index: parseInt(value) || 0 })}
                min="0"
              />

              <FormField
                label="Image URL"
                type="url"
                value={formData.image_url}
                onChange={(value) => setFormData({ ...formData, image_url: value })}
                placeholder="https://example.com/image.jpg"
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <FormField
              label="Content"
              type="textarea"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              rows={6}
              required
            />

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

      {/* Content List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pageContents.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pages.find(p => p.id === content.page_id)?.name || content.page_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {content.section_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {content.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {content.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    content.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {content.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(content.updated_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(content)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(content.id, content.is_active)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {content.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
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

      {pageContents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900 mb-2">No page content found</p>
          <p className="text-gray-500 mb-4">Create your first page content to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Content
          </Button>
        </div>
      )}
    </div>
  );
};

export default PageContentManager;