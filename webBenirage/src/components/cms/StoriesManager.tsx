import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, MoreVertical, Edit, Eye, Calendar, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Story {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  author_name?: string;
  status: string;
  story_type: string;
  featured_image?: string;
  multimedia_content?: unknown;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
}

const StoriesManager: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.excerpt && story.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (story.author_name && story.author_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading stories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stories Management</h2>
          <p className="text-gray-600">Manage multimedia stories and content</p>
        </div>
        <Button icon={Plus}>
          Create Story
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredStories.map((story) => (
          <Card key={story.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{story.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(story.status)}`}>
                    {story.status}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {story.story_type}
                  </span>
                </div>

                {story.excerpt && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{story.excerpt}</p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                  {story.author_name && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{story.author_name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(story.created_at)}</span>
                  </div>
                  {story.published_at && (
                    <div className="flex items-center space-x-2">
                      <span>Published: {formatDate(story.published_at)}</span>
                    </div>
                  )}
                </div>

                {typeof story.multimedia_content !== 'undefined' && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">
                      Has multimedia content
                    </span>
                  </div>
                )}

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by creating your first story.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default StoriesManager;