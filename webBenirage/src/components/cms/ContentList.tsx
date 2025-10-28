import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getContent, deleteContent } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { FileText, Edit, Trash2, Plus, Search } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type Content = Database['public']['Tables']['content']['Row'];

interface ContentListProps {
  contentType?: string;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

const ContentList: React.FC<ContentListProps> = ({ contentType, onEdit, onCreateNew }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadContent = useCallback(async () => {
    try {
      const result = await getContent(contentType, 'all', 100);

      if (result.success && result.data) {
        setContent(result.data);
      } else {
        console.error('Error loading content:', result.error);
        setContent([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => {
    loadContent();
  }, [contentType, loadContent]);

  const deleteContentItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;

    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to delete content.');
        return;
      }

      const result = await deleteContent(id, user.email || 'Unknown');

      if (result.success) {
        setContent(prev => prev.filter(item => item.id !== id));
        // Show success message
        alert('Content deleted successfully');
      } else {
        console.error('Error deleting content:', result.error);
        const errorMessage = typeof result.error === 'string' ? result.error : 'Unknown error occurred';
        alert(`Error deleting content: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Error deleting content: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const filteredContent = content.filter(item => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(searchLower) ||
           (item.excerpt && item.excerpt.toLowerCase().includes(searchLower)) ||
           item.content.toLowerCase().includes(searchLower);
  });

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
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Content Management</h2>
          <p className="text-gray-600">Manage your website content</p>
        </div>
        <Button onClick={onCreateNew} icon={Plus}>
          Create New Content
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent.length > 0 ? (
          filteredContent.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.excerpt || 'No excerpt'}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Type: {item.type}</span>
                      <span>Status: {item.status}</span>
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item.id)} icon={Edit}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteContentItem(item.id)} icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Content Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No content matches your search.' : 'Start creating content for your website.'}
            </p>
            <Button onClick={onCreateNew} icon={Plus}>
              Create Your First Content
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentList;