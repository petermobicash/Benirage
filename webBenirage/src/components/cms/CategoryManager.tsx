import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Tag, Folder } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon: string;
  parent_id?: string;
  order_index: number;
  created_at: string;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#2563eb',
    icon: '📁',
    parent_id: '',
    order_index: 0
  });
  const { showToast } = useToast();

  const colors = [
    { value: '#2563eb', label: 'Blue' },
    { value: '#059669', label: 'Green' },
    { value: '#dc2626', label: 'Red' },
    { value: '#7c3aed', label: 'Purple' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#c2410c', label: 'Orange Red' },
    { value: '#be185d', label: 'Pink' },
    { value: '#374151', label: 'Gray' }
  ];

  const icons = [
    '📁', '📝', '🎯', '💡', '🌟', '🔥', '💎', '🎨', '🚀', '⚡',
    '🌱', '🎪', '🎭', '🎵', '📚', '🔬', '🏆', '🎲', '🎪', '🎨'
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const categoryData = {
        ...formData,
        slug,
        parent_id: formData.parent_id || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Category updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);

        if (error) throw error;
        showToast('Category created successfully', 'success');
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      parent_id: category.parent_id || '',
      order_index: category.order_index
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#2563eb',
      icon: '📁',
      parent_id: '',
      order_index: 0
    });
    setEditingId(null);
  };

  const getParentName = (parentId: string) => {
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '';
  };

  const getChildrenCount = (categoryId: string) => {
    return categories.filter(c => c.parent_id === categoryId).length;
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
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Category' : 'Edit Category'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Category Name"
                type="text"
                value={formData.name || ''}
                onChange={(value) => {
                  const nameValue = String(value);
                  setFormData({
                    ...formData,
                    name: nameValue,
                    slug: generateSlug(nameValue)
                  });
                }}
                required
              />

              <FormField
                label="Slug"
                type="text"
                value={formData.slug || ''}
                onChange={(value) => setFormData({ ...formData, slug: String(value) })}
                placeholder="auto-generated-from-name"
              />

              <FormField
                label="Color"
                type="select"
                value={formData.color || ''}
                onChange={(value) => setFormData({ ...formData, color: String(value) })}
                options={colors}
              />

              <FormField
                label="Icon"
                type="select"
                value={formData.icon || ''}
                onChange={(value) => setFormData({ ...formData, icon: String(value) })}
                options={icons.map(icon => ({ value: icon, label: `${icon} ${icon}` }))}
              />

              <FormField
                label="Parent Category"
                type="select"
                value={formData.parent_id || ''}
                onChange={(value) => setFormData({ ...formData, parent_id: String(value) })}
                options={[
                  { value: '', label: 'No Parent (Top Level)' },
                  ...categories
                    .filter(c => c.id !== editingId)
                    .map(c => ({ value: c.id, label: c.name }))
                ]}
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index || 0}
                onChange={(value) => setFormData({ ...formData, order_index: parseInt(String(value)) || 0 })}
                min="0"
              />
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description || ''}
              onChange={(value) => setFormData({ ...formData, description: String(value) })}
              rows={3}
              placeholder="Brief description of the category..."
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

      {/* Categories List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Children
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
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
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {category.name}
                        <div
                          className="w-3 h-3 rounded-full ml-2"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {category.slug}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.parent_id ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      <Folder className="w-3 h-3 mr-1" />
                      {getParentName(category.parent_id)}
                    </span>
                  ) : (
                    <span className="text-gray-400">Top Level</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getChildrenCount(category.id) > 0 ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {getChildrenCount(category.id)} children
                    </span>
                  ) : (
                    <span className="text-gray-400">No children</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(category.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No categories found</p>
          <p className="text-gray-500 mb-4">Create your first category to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;