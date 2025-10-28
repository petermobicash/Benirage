import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { supabase } from '../../lib/supabase';

interface TagData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const TagManager = () => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_tags')
        .select(`
          *,
          content_items(count)
        `)
        .order('name');

      if (error) throw error;

      const tagsWithCount = data?.map(tag => ({
        ...tag,
        usage_count: tag.content_items?.[0]?.count || 0
      })) || [];

      setTags(tagsWithCount);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    try {
      const slug = generateSlug(formData.name);

      if (editingId === 'new') {
        const { error } = await supabase
          .from('content_tags')
          .insert([{
            name: formData.name.trim(),
            slug,
            description: formData.description.trim(),
            color: formData.color
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_tags')
          .update({
            name: formData.name.trim(),
            slug,
            description: formData.description.trim(),
            color: formData.color
          })
          .eq('id', editingId);

        if (error) throw error;
      }

      await fetchTags();
      resetForm();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag: TagData) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('content_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'used') return matchesSearch && tag.usage_count > 0;
    if (filterBy === 'unused') return matchesSearch && tag.usage_count === 0;

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tag Management</h2>
          <p className="text-gray-600">Organize and manage content tags</p>
        </div>
        <Button onClick={() => setEditingId('new')} icon={Plus}>
          Add Tag
        </Button>
      </div>

      {/* Add/Edit Form */}
      {editingId && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tag Name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter tag name"
                required
                type="text"
              />

              <FormField
                label="Color"
                value={formData.color || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                type="select"
                options={colorOptions.map(color => color)}
              />
            </div>

            <FormField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter tag description (optional)"
              type="textarea"
            />

            <div className="flex space-x-4">
              <Button type="submit">
                {editingId === 'new' ? 'Create Tag' : 'Update Tag'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              <option value="used">Used Tags</option>
              <option value="unused">Unused Tags</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => (
          <Card key={tag.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                ></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                  <p className="text-sm text-gray-600">{tag.slug}</p>
                  {tag.description && (
                    <p className="text-sm text-gray-500 mt-1">{tag.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {tag.usage_count} uses
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tag)}
                  icon={Edit2}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(tag.id)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <Card className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tags Found</h3>
          <p className="text-gray-500">
            {searchTerm || filterBy !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first tag to get started.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default TagManager;