import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Heart, Eye, Calendar, MapPin, User, Plus, Filter, Search, Play, Volume2, Video, FileText, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import MultimediaStoryPlayer from '../components/storytelling/MultimediaStoryPlayer';
import { MultimediaStory, StoryMediaType } from '../types/storytelling';
import MediaStorageService from '../utils/mediaStorage';

type Story = MultimediaStory;

interface StoryFormData {
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_location: string;
  story_type: string;
  category: string;
  is_anonymous: boolean;
  tags: string;
  media_type?: StoryMediaType;
  audio_file?: File;
  video_file?: File;
  image_file?: File;
  transcript?: string;
}

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<StoryMediaType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'featured' | 'submit'>('browse');
  const [selectedStory, setSelectedStory] = useState<MultimediaStory | null>(null);

  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    author_name: '',
    author_email: '',
    author_location: '',
    story_type: 'personal',
    category: 'cultural',
    is_anonymous: false,
    tags: '',
    media_type: 'text'
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);

  const { showToast } = useToast();

  const storyTypes = [
    { value: 'personal', label: 'Personal Story' },
    { value: 'family', label: 'Family History' },
    { value: 'cultural', label: 'Cultural Tradition' },
    { value: 'historical', label: 'Historical Event' },
    { value: 'wisdom', label: 'Wisdom Teaching' },
    { value: 'other', label: 'Other' }
  ];

  const storyCategories = [
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'philosophical', label: 'Philosophical' },
    { value: 'community', label: 'Community' },
    { value: 'personal_growth', label: 'Personal Growth' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'other', label: 'Other' }
  ];


  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch stories from database using the new multimedia function
      const { data: dbStories, error: dbError } = await supabase
        .rpc('get_stories_by_media_type');

      if (dbError) throw dbError;

      // Convert database stories to MultimediaStory format
      const allStories: MultimediaStory[] = (dbStories || []).map((story: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: story.id,
        title: story.title,
        content: story.content,
        author_name: story.author_name,
        author_email: story.author_email,
        author_location: story.author_location,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        story_type: story.story_type as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        category: story.category as any,
        is_anonymous: story.is_anonymous,
        is_featured: story.is_featured,
        is_approved: story.is_approved,
        view_count: story.view_count,
        tags: story.tags || [],
        submitted_at: story.submitted_at,
        created_at: story.created_at,
        media_type: story.media_type,
        audio_url: story.audio_url,
        video_url: story.video_url,
        audio_duration: story.audio_duration,
        video_duration: story.video_duration,
        transcript: story.transcript,
        thumbnail_url: story.thumbnail_url
      }));

      setStories(allStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      showToast('Failed to load stories', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const filterStories = useCallback(() => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(story => story.story_type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(story => story.category === categoryFilter);
    }

    if (mediaTypeFilter !== 'all') {
      filtered = filtered.filter(story => story.media_type === mediaTypeFilter);
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, typeFilter, categoryFilter, mediaTypeFilter]);

  useEffect(() => {
    filterStories();
  }, [filterStories]);

  const handleInputChange = (field: keyof StoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'audio' | 'video' | 'image') => {
    const input = document.createElement('input');
    input.type = 'file';

    if (type === 'audio') {
      input.accept = 'audio/*';
    } else if (type === 'video') {
      input.accept = 'video/*';
    } else {
      input.accept = 'image/*';
    }

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size
      const maxSizes = {
        audio: 50 * 1024 * 1024, // 50MB
        video: 100 * 1024 * 1024, // 100MB
        image: 10 * 1024 * 1024   // 10MB
      };

      if (file.size > maxSizes[type]) {
        showToast(`File too large. Maximum size for ${type} is ${Math.round(maxSizes[type] / 1024 / 1024)}MB`, 'error');
        return;
      }

      setFormData(prev => ({ ...prev, [`${type}_file`]: file }));
      showToast(`${type} file selected successfully!`, 'success');
    };

    input.click();
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author_name.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // For multimedia stories, content is optional if media is provided
    if (formData.media_type !== 'text' && !formData.content.trim() && !formData.audio_file && !formData.video_file && !formData.image_file) {
      showToast('Please provide either text content or media files', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // First, create the basic story record to get an ID
      const storyData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author_name: formData.author_name.trim(),
        author_email: formData.author_email.trim() || null,
        author_location: formData.author_location.trim() || null,
        story_type: formData.story_type,
        category: formData.category,
        is_anonymous: formData.is_anonymous,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        media_type: formData.media_type || 'text'
      };

      const { data: storyRecord, error: insertError } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload media files if provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const multimediaData: any = {};

      if (formData.audio_file && storyRecord.id) {
        try {
          setUploadingMedia(true);
          const audioResult = await MediaStorageService.uploadMedia({
            file: formData.audio_file,
            storyId: storyRecord.id,
            type: 'audio'
          });

          multimediaData.audio_url = audioResult.url;
          multimediaData.audio_duration = await MediaStorageService.getAudioDuration(formData.audio_file);

          showToast('Audio file uploaded successfully', 'success');
        } catch (uploadError) {
          console.error('Audio upload error:', uploadError);
          showToast('Failed to upload audio file', 'error');
        }
      }

      if (formData.video_file && storyRecord.id) {
        try {
          setUploadingMedia(true);
          const videoResult = await MediaStorageService.uploadMedia({
            file: formData.video_file,
            storyId: storyRecord.id,
            type: 'video'
          });

          multimediaData.video_url = videoResult.url;

          // Get video metadata
          const videoMetadata = await MediaStorageService.getVideoMetadata(formData.video_file);
          multimediaData.video_duration = videoMetadata.duration;

          // Generate thumbnail if available
          if (videoMetadata.thumbnail) {
            multimediaData.thumbnail_url = videoMetadata.thumbnail;
          }

          showToast('Video file uploaded successfully', 'success');
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          showToast('Failed to upload video file', 'error');
        }
      }

      if (formData.image_file && storyRecord.id) {
        try {
          setUploadingMedia(true);
          const imageResult = await MediaStorageService.uploadMedia({
            file: formData.image_file,
            storyId: storyRecord.id,
            type: 'image'
          });

          multimediaData.image_url = imageResult.url;
          showToast('Image file uploaded successfully', 'success');
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          showToast('Failed to upload image file', 'error');
        }
      }

      // Add transcript if provided
      if (formData.transcript) {
        multimediaData.transcript = formData.transcript;
      }

      // Update story with multimedia data if any media was uploaded
      if (Object.keys(multimediaData).length > 0) {
        const { error: updateError } = await supabase
          .from('stories')
          .update(multimediaData)
          .eq('id', storyRecord.id);

        if (updateError) {
          console.error('Error updating story with multimedia data:', updateError);
          showToast('Story saved but failed to save media information', 'warning');
        }
      }

      showToast('Thank you for sharing your story! It will be reviewed before being published.', 'success');

      // Reset form
      setFormData({
        title: '',
        content: '',
        author_name: '',
        author_email: '',
        author_location: '',
        story_type: 'personal',
        category: 'cultural',
        is_anonymous: false,
        tags: '',
        media_type: 'text',
        transcript: ''
      });

      setActiveTab('browse');
      fetchStories();
    } catch (error) {
      console.error('Error submitting story:', error);
      showToast('Failed to submit story', 'error');
    } finally {
      setSubmitting(false);
      setUploadingMedia(false);
    }
  };

  const incrementViewCount = async (storyId: string) => {
    try {
      await supabase.rpc('increment_story_views', { story_id: storyId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleStoryClick = (story: Story) => {
    incrementViewCount(story.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golden/10 to-dark-blue/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-blue mb-4">
            📖 Storytelling & Oral History
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Share and discover the rich tapestry of stories that connect us to our heritage,
            wisdom, and shared human experience. Every voice matters in preserving our cultural legacy.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setActiveTab('browse')}
              variant={activeTab === 'browse' ? 'primary' : 'outline'}
              size="lg"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Stories
            </Button>
            <Button
              onClick={() => setActiveTab('featured')}
              variant={activeTab === 'featured' ? 'primary' : 'outline'}
              size="lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Featured Stories
            </Button>
            <Button
              onClick={() => setActiveTab('submit')}
              variant={activeTab === 'submit' ? 'primary' : 'outline'}
              size="lg"
              className="bg-gradient-to-r from-golden to-dark-blue hover:from-golden/90 hover:to-dark-blue/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Share Your Story
            </Button>
          </div>
        </div>

        {/* Browse Stories Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Filters */}
            <Card>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search stories by title, content, or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-golden focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    {storyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-golden focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {storyCategories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={mediaTypeFilter}
                    onChange={(e) => setMediaTypeFilter(e.target.value as StoryMediaType | 'all')}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-golden focus:border-transparent"
                  >
                    <option value="all">All Media Types</option>
                    <option value="text">📝 Text Stories</option>
                    <option value="audio">🎵 Audio Stories</option>
                    <option value="video">🎥 Video Stories</option>
                    <option value="mixed">🎬 Mixed Media</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Stories Grid */}
            {filteredStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                  <Card key={story.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="p-6">
                      {story.is_featured && (
                        <div className="flex items-center mb-3">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            Featured
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-dark-blue mb-3 line-clamp-2">
                        {story.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {story.content}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{story.is_anonymous ? 'Anonymous' : story.author_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{story.view_count} views</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {story.media_type === 'audio' && <Volume2 className="w-4 h-4 text-golden" />}
                          {story.media_type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                          {story.media_type === 'mixed' && <Play className="w-4 h-4 text-purple-600" />}
                          {(!story.media_type || story.media_type === 'text') && <FileText className="w-4 h-4 text-gray-500" />}
                          {story.media_type && story.media_type !== 'text' && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                              {story.media_type}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            story.story_type === 'cultural' ? 'bg-golden/20 text-golden' :
                            story.story_type === 'wisdom' ? 'bg-purple-100 text-purple-800' :
                            story.category === 'spiritual' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {storyTypes.find(t => t.value === story.story_type)?.label}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            story.category === 'cultural' ? 'bg-golden/20 text-golden' :
                            story.category === 'spiritual' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {storyCategories.find(c => c.value === story.category)?.label}
                          </span>
                        </div>
                      </div>

                      {story.author_location && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{story.author_location}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(story.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        {story.media_type && story.media_type !== 'text' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedStory(story)}
                          >
                            {story.media_type === 'audio' && <Volume2 className="w-4 h-4 mr-2" />}
                            {story.media_type === 'video' && <Video className="w-4 h-4 mr-2" />}
                            {story.media_type === 'mixed' && <Play className="w-4 h-4 mr-2" />}
                            Play {story.media_type === 'audio' ? 'Audio' : story.media_type === 'video' ? 'Video' : 'Media'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleStoryClick(story)}
                          >
                            Read Full Story
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stories Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Be the first to share a story with our community!'}
                </p>
                <Button onClick={() => setActiveTab('submit')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Featured Stories Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-dark-blue mb-4">⭐ Featured Stories</h2>
              <p className="text-gray-600">
                Discover our community's most inspiring and cherished stories
              </p>
            </div>

            {stories.filter(story => story.is_featured).length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stories.filter(story => story.is_featured).map((story) => (
                  <Card key={story.id} className="hover:shadow-lg transition-all duration-300">
                    <div className="p-8">
                      <div className="flex items-center mb-4">
                        <Heart className="w-6 h-6 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                          Featured Story
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-dark-blue mb-4">
                        {story.title}
                      </h3>

                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {story.content}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{story.is_anonymous ? 'Anonymous' : story.author_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{story.view_count} views</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          story.story_type === 'cultural' ? 'bg-golden/20 text-golden' :
                          story.category === 'spiritual' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {storyTypes.find(t => t.value === story.story_type)?.label}
                        </span>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          story.category === 'cultural' ? 'bg-golden/20 text-golden' :
                          story.category === 'spiritual' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {storyCategories.find(c => c.value === story.category)?.label}
                        </span>
                      </div>

                      {story.author_location && (
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{story.author_location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(story.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Featured Stories Yet</h3>
                <p className="text-gray-500">
                  Featured stories will appear here once our community curators select them.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Submit Story Tab */}
        {activeTab === 'submit' && (
          <Card className="max-w-4xl mx-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-dark-blue mb-6 text-center">
                🌟 Share Your Story
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Every story has the power to inspire, teach, and connect us. Share your experience with our community.
              </p>

              <form onSubmit={handleSubmitStory} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Give your story a meaningful title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.author_name || ''}
                      onChange={(e) => handleInputChange('author_name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.author_email || ''}
                      onChange={(e) => handleInputChange('author_email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.author_location || ''}
                      onChange={(e) => handleInputChange('author_location', e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Story Type
                    </label>
                    <select
                      value={formData.story_type || ''}
                      onChange={(e) => handleInputChange('story_type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    >
                      {storyTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    >
                      {storyCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="wisdom, culture, heritage, spirituality (comma-separated)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">
                    Your Story *
                  </label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Share your story, wisdom, or cultural experience..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-vertical"
                    required
                  />
                </div>

                {/* Media Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-dark-blue mb-2">
                    Media Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.media_type === 'text' ? 'border-golden bg-golden/10' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="media_type"
                        value="text"
                        checked={formData.media_type === 'text'}
                        onChange={(e) => handleInputChange('media_type', e.target.value as StoryMediaType)}
                        className="mr-2 text-golden focus:ring-golden"
                      />
                      <FileText className="w-5 h-5 mr-2" />
                      <span className="text-sm">Text Only</span>
                    </label>

                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.media_type === 'audio' ? 'border-golden bg-golden/10' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="media_type"
                        value="audio"
                        checked={formData.media_type === 'audio'}
                        onChange={(e) => handleInputChange('media_type', e.target.value as StoryMediaType)}
                        className="mr-2 text-golden focus:ring-golden"
                      />
                      <Volume2 className="w-5 h-5 mr-2" />
                      <span className="text-sm">Audio</span>
                    </label>

                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.media_type === 'video' ? 'border-golden bg-golden/10' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="media_type"
                        value="video"
                        checked={formData.media_type === 'video'}
                        onChange={(e) => handleInputChange('media_type', e.target.value as StoryMediaType)}
                        className="mr-2 text-golden focus:ring-golden"
                      />
                      <Video className="w-5 h-5 mr-2" />
                      <span className="text-sm">Video</span>
                    </label>

                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.media_type === 'mixed' ? 'border-golden bg-golden/10' : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="media_type"
                        value="mixed"
                        checked={formData.media_type === 'mixed'}
                        onChange={(e) => handleInputChange('media_type', e.target.value as StoryMediaType)}
                        className="mr-2 text-golden focus:ring-golden"
                      />
                      <Play className="w-5 h-5 mr-2" />
                      <span className="text-sm">Mixed Media</span>
                    </label>
                  </div>
                </div>

                {/* File Upload Section */}
                {(formData.media_type === 'audio' || formData.media_type === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Audio File
                    </label>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleFileUpload('audio')}
                        disabled={uploadingMedia}
                        icon={Volume2}
                      >
                        {uploadingMedia ? 'Uploading...' : 'Upload Audio'}
                      </Button>
                      {formData.audio_file && (
                        <span className="text-sm text-green-600 flex items-center">
                          <Volume2 className="w-4 h-4 mr-1" />
                          {formData.audio_file.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: MP3, WAV, M4A (Max 50MB)</p>
                  </div>
                )}

                {(formData.media_type === 'video' || formData.media_type === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Video File
                    </label>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleFileUpload('video')}
                        disabled={uploadingMedia}
                        icon={Video}
                      >
                        {uploadingMedia ? 'Uploading...' : 'Upload Video'}
                      </Button>
                      {formData.video_file && (
                        <span className="text-sm text-green-600 flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          {formData.video_file.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: MP4, WebM, MOV (Max 100MB)</p>
                  </div>
                )}

                {(formData.media_type === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Cover Image (Optional)
                    </label>
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleFileUpload('image')}
                        disabled={uploadingMedia}
                        icon={Image}
                      >
                        {uploadingMedia ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      {formData.image_file && (
                        <span className="text-sm text-green-600 flex items-center">
                          <Image className="w-4 h-4 mr-1" />
                          {formData.image_file.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, WebP (Max 10MB)</p>
                  </div>
                )}

                {/* Transcript for audio/video content */}
                {(formData.media_type === 'audio' || formData.media_type === 'video' || formData.media_type === 'mixed') && (
                  <div>
                    <label className="block text-sm font-medium text-dark-blue mb-2">
                      Transcript (Optional)
                    </label>
                    <textarea
                      value={formData.transcript || ''}
                      onChange={(e) => handleInputChange('transcript', e.target.value)}
                      placeholder="Provide a written transcript of your audio/video content for accessibility..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-vertical"
                    />
                    <p className="text-xs text-gray-500 mt-1">Help make your content accessible to everyone by providing a transcript</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                    className="rounded border-gray-300 text-golden focus:ring-golden"
                  />
                  <label htmlFor="is_anonymous" className="text-sm text-gray-700">
                    Share anonymously (your name won't be displayed publicly)
                  </label>
                </div>

                <div className="text-center pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="min-w-[200px] bg-gradient-to-r from-golden to-dark-blue hover:from-golden/90 hover:to-dark-blue/90"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Story...</span>
                      </div>
                    ) : (
                      '📖 Share My Story'
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">
                    By submitting, you agree that your story may be shared publicly and you grant BENIRAGE permission to feature it.
                  </p>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Multimedia Story Player Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <MultimediaStoryPlayer
                story={selectedStory}
                onClose={() => setSelectedStory(null)}
                className="max-h-[90vh]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;