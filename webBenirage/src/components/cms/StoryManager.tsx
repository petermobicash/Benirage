import { useState, useEffect, useCallback } from 'react';
import {
  Edit, Save, X, Trash2, Eye, Check, XCircle, Star, StarOff,
  Search, Filter, Printer, MapPin, BookOpen, AlertCircle, CheckCircle2,
  Volume2, Video, Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { MultimediaStory, StoryMediaType } from '../../types/storytelling';
import MediaStorageService from '../../utils/mediaStorage';

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
  is_featured: boolean;
  is_approved: boolean;
  tags: string;
}

type MediaDataValue = string | StoryMediaType | File | undefined;

interface MultimediaData {
  media_type: StoryMediaType;
  transcript?: string | null;
  audio_url?: string;
  audio_duration?: number;
  video_url?: string;
  video_duration?: number;
  thumbnail_url?: string;
}

type StoryUpdateData = {
  is_approved: boolean;
  is_featured: boolean;
  approved_at?: string;
}

const StoryManager = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    author_name: '',
    author_email: '',
    author_location: '',
    story_type: 'personal',
    category: 'cultural',
    is_anonymous: false,
    is_featured: false,
    is_approved: false,
    tags: ''
  });

  const [mediaData, setMediaData] = useState<{
    media_type: StoryMediaType;
    audio_file?: File;
    video_file?: File;
    transcript?: string;
  }>({
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

  const statusOptions = [
    { value: 'all', label: 'All Stories' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];


  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);

      // Use admin function to get all stories (including unapproved)
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      showToast('Failed to load stories', 'error');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStories, showToast]);

  const filterStories = useCallback(() => {
    let filtered = stories;

    if (searchTerm) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        filtered = filtered.filter(story => !story.is_approved);
      } else if (statusFilter === 'approved') {
        filtered = filtered.filter(story => story.is_approved);
      } else if (statusFilter === 'rejected') {
        filtered = filtered.filter(story => story.is_approved === false);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(story => story.story_type === typeFilter);
    }

    setFilteredStories(filtered);
  }, [stories, searchTerm, statusFilter, typeFilter, setFilteredStories]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    filterStories();
  }, [stories, searchTerm, statusFilter, typeFilter, filterStories]);

  const handleInputChange = (field: keyof StoryFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaChange = (field: keyof typeof mediaData, value: MediaDataValue) => {
    setMediaData(prev => ({ ...prev, [field]: value }));
  };

  const simulateMediaUpload = async (type: 'audio' | 'video'): Promise<string> => {
    setUploadingMedia(true);

    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock URLs based on file type
    if (type === 'audio') {
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC';
    } else {
      return 'data:video/mp4;base64,AAAAHGZ0eXBtc28yYXZpczEAAAAgbmFtZV9zcGFjZQBAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACYW5jZQB';
    }
  };

  const handleFileUpload = async (type: 'audio' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : 'video/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setUploadingMedia(true);

        // Use real media storage service
        await MediaStorageService.uploadMedia({
          file,
          storyId: editingStory?.id,
          type,
          onProgress: (progress) => {
            console.log(`${type} upload progress: ${progress}%`);
          }
        });

        if (type === 'audio') {
          handleMediaChange('audio_file', file);
        } else {
          handleMediaChange('video_file', file);
        }

        showToast(`${type} file uploaded successfully!`, 'success');
      } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        showToast(`Failed to upload ${type} file`, 'error');
      } finally {
        setUploadingMedia(false);
      }
    };

    input.click();
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      author_name: story.author_name,
      author_email: story.author_email || '',
      author_location: story.author_location || '',
      story_type: story.story_type,
      category: story.category,
      is_anonymous: story.is_anonymous,
      is_featured: story.is_featured,
      is_approved: story.is_approved,
      tags: story.tags.join(', ')
    });

    // Set media data
    setMediaData({
      media_type: story.media_type || 'text',
      transcript: story.transcript || ''
    });

    setShowEditModal(true);
  };

  const handleSaveStory = async () => {
    if (!editingStory) return;

    try {
      setUploadingMedia(true);

      // Prepare multimedia data
      const multimediaData: MultimediaData = {
        media_type: mediaData.media_type,
        transcript: mediaData.transcript || null
      };

      // Upload new audio file if provided
      if (mediaData.audio_file) {
        try {
          const audioResult = await MediaStorageService.uploadMedia({
            file: mediaData.audio_file,
            storyId: editingStory.id,
            type: 'audio'
          });

          multimediaData.audio_url = audioResult.url;

          // Get audio duration
          if (mediaData.audio_file) {
            multimediaData.audio_duration = await MediaStorageService.getAudioDuration(mediaData.audio_file);
          }

          showToast('Audio file uploaded successfully', 'success');
        } catch (uploadError) {
          console.error('Audio upload error:', uploadError);
          showToast('Failed to upload audio file', 'error');
        }
      }

      // Upload new video file if provided
      if (mediaData.video_file) {
        try {
          const videoResult = await MediaStorageService.uploadMedia({
            file: mediaData.video_file,
            storyId: editingStory.id,
            type: 'video'
          });

          multimediaData.video_url = videoResult.url;

          // Get video metadata
          if (mediaData.video_file) {
            const videoMetadata = await MediaStorageService.getVideoMetadata(mediaData.video_file);
            multimediaData.video_duration = videoMetadata.duration;

            // Generate thumbnail if we got metadata
            if (videoMetadata.thumbnail) {
              // In a real implementation, upload the thumbnail
              multimediaData.thumbnail_url = videoMetadata.thumbnail;
            }
          }

          showToast('Video file uploaded successfully', 'success');
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          showToast('Failed to upload video file', 'error');
        }
      }

      const { error } = await supabase
        .from('stories')
        .update({
          title: formData.title,
          content: formData.content,
          author_name: formData.author_name,
          author_email: formData.author_email || null,
          author_location: formData.author_location || null,
          story_type: formData.story_type,
          category: formData.category,
          is_anonymous: formData.is_anonymous,
          is_featured: formData.is_featured,
          is_approved: formData.is_approved,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          ...multimediaData
        })
        .eq('id', editingStory.id);

      if (error) throw error;

      showToast('Story updated successfully', 'success');
      setShowEditModal(false);
      setEditingStory(null);

      // Reset media data
      setMediaData({
        media_type: 'text'
      });

      fetchStories();
    } catch (error) {
      console.error('Error updating story:', error);
      showToast('Failed to update story', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleStatusUpdate = async (storyId: string, isApproved: boolean, isFeatured: boolean = false) => {
    try {
      const updateData: StoryUpdateData = {
        is_approved: isApproved,
        is_featured: isFeatured
      };

      if (isApproved) {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('stories')
        .update(updateData)
        .eq('id', storyId);

      if (error) throw error;

      showToast(
        `Story ${isApproved ? 'approved' : 'rejected'} ${isFeatured ? 'and featured' : ''}`,
        'success'
      );
      fetchStories();
    } catch (error) {
      console.error('Error updating story status:', error);
      showToast('Failed to update story status', 'error');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      showToast('Story deleted successfully', 'success');
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      showToast('Failed to delete story', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedStories.size === 0) {
      showToast('Please select stories to approve', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_approved: true, approved_at: new Date().toISOString() })
        .in('id', Array.from(selectedStories));

      if (error) throw error;

      showToast(`${selectedStories.size} stories approved successfully`, 'success');
      setSelectedStories(new Set());
      fetchStories();
    } catch (error) {
      console.error('Error bulk approving stories:', error);
      showToast('Failed to approve stories', 'error');
    }
  };

  const handleBulkFeature = async () => {
    if (selectedStories.size === 0) {
      showToast('Please select stories to feature', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('stories')
        .update({ is_featured: true })
        .in('id', Array.from(selectedStories));

      if (error) throw error;

      showToast(`${selectedStories.size} stories featured successfully`, 'success');
      setSelectedStories(new Set());
      fetchStories();
    } catch (error) {
      console.error('Error featuring stories:', error);
      showToast('Failed to feature stories', 'error');
    }
  };

  const handlePrintStory = (story: Story) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${story.title} - BENIRAGE Stories</title>
          <style>
            body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .story-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .story-meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .story-content { font-size: 16px; white-space: pre-wrap; }
            .story-category { display: inline-block; background: #f0f0f0; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 5px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BENIRAGE</h1>
            <p>Storytelling & Oral History Collection</p>
          </div>

          <div class="story-title">${story.title}</div>

          <div class="story-meta">
            <p><strong>Author:</strong> ${story.is_anonymous ? 'Anonymous' : story.author_name}</p>
            ${story.author_location ? `<p><strong>Location:</strong> ${story.author_location}</p>` : ''}
            <p><strong>Type:</strong> ${storyTypes.find(t => t.value === story.story_type)?.label}</p>
            <p><strong>Category:</strong> ${storyCategories.find(c => c.value === story.category)?.label}</p>
            <p><strong>Submitted:</strong> ${new Date(story.submitted_at).toLocaleDateString()}</p>
            <p><strong>Views:</strong> ${story.view_count}</p>
          </div>

          ${story.tags.length > 0 ? `
            <div style="margin-bottom: 20px;">
              ${story.tags.map(tag => `<span class="story-category">${tag}</span>`).join('')}
            </div>
          ` : ''}

          <div class="story-content">${story.content}</div>

          <div class="footer">
            <p>This story is part of the BENIRAGE Storytelling & Oral History collection.</p>
            <p>Preserving cultural heritage, wisdom, and community stories.</p>
            <p>Printed on: ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSelectStory = (storyId: string, checked: boolean) => {
    const newSelected = new Set(selectedStories);
    if (checked) {
      newSelected.add(storyId);
    } else {
      newSelected.delete(storyId);
    }
    setSelectedStories(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStories(new Set(filteredStories.map(story => story.id)));
    } else {
      setSelectedStories(new Set());
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Story Management</h2>
          <p className="text-gray-600">Review, edit, and manage community stories</p>
        </div>
        <div className="flex space-x-2">
          {selectedStories.size > 0 && (
            <>
              <Button onClick={handleBulkApprove} variant="outline" size="sm">
                <Check className="w-4 h-4 mr-2" />
                Approve ({selectedStories.size})
              </Button>
              <Button onClick={handleBulkFeature} variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Feature ({selectedStories.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {storyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedStories.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedStories.size} stories selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedStories(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stories Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStories.size === filteredStories.length && filteredStories.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Story
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type/Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStories.has(story.id)}
                      onChange={(e) => handleSelectStory(story.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {story.title}
                          </p>
                          {story.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {story.content.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {story.is_anonymous ? 'Anonymous' : story.author_name}
                    </div>
                    {story.author_location && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {story.author_location}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.story_type === 'cultural' ? 'bg-golden/20 text-golden' :
                        story.story_type === 'wisdom' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {storyTypes.find(t => t.value === story.story_type)?.label}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.category === 'spiritual' ? 'bg-blue-100 text-blue-800' :
                        story.category === 'cultural' ? 'bg-golden/20 text-golden' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {storyCategories.find(c => c.value === story.category)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {(!story.media_type || story.media_type === 'text') && (
                        <span className="flex items-center text-xs text-gray-500">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Text
                        </span>
                      )}
                      {story.media_type === 'audio' && (
                        <span className="flex items-center text-xs text-golden bg-golden/10 px-2 py-1 rounded-full">
                          <Volume2 className="w-3 h-3 mr-1" />
                          Audio
                        </span>
                      )}
                      {story.media_type === 'video' && (
                        <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Video className="w-3 h-3 mr-1" />
                          Video
                        </span>
                      )}
                      {story.media_type === 'mixed' && (
                        <span className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          <Play className="w-3 h-3 mr-1" />
                          Mixed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {story.is_approved ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {story.view_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(story.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStory(story)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {!story.is_approved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(story.id, true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(story.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(story.id, story.is_approved, !story.is_featured)}
                      >
                        {story.is_featured ? (
                          <StarOff className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintStory(story)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteStory(story.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredStories.length === 0 && (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stories Found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No stories have been submitted yet.'}
          </p>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && editingStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Story</h3>
                <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Story Title"
                  type="text"
                  value={formData.title || ''}
                  onChange={(value) => handleInputChange('title', value)}
                  required
                />

                <FormField
                  label="Author Name"
                  type="text"
                  value={formData.author_name || ''}
                  onChange={(value) => handleInputChange('author_name', value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Author Email"
                  type="email"
                  value={formData.author_email || ''}
                  onChange={(value) => handleInputChange('author_email', value)}
                />

                <FormField
                  label="Author Location"
                  type="text"
                  value={formData.author_location || ''}
                  onChange={(value) => handleInputChange('author_location', value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Story Type"
                  type="select"
                  value={formData.story_type || ''}
                  onChange={(value) => handleInputChange('story_type', value)}
                  options={storyTypes.map(type => ({ value: type.value, label: type.label }))}
                />

                <FormField
                  label="Category"
                  type="select"
                  value={formData.category || ''}
                  onChange={(value) => handleInputChange('category', value)}
                  options={storyCategories.map(cat => ({ value: cat.value, label: cat.label }))}
                />
              </div>

              <FormField
                label="Tags (comma-separated)"
                type="text"
                value={formData.tags || ''}
                onChange={(value) => handleInputChange('tags', value)}
                placeholder="wisdom, culture, heritage, spirituality"
              />

              <FormField
                label="Story Content"
                type="textarea"
                value={formData.content || ''}
                onChange={(value) => handleInputChange('content', value)}
                rows={8}
                required
              />

              {/* Multimedia Section */}
              <div className="border-t pt-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Multimedia Content</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type
                    </label>
                    <select
                      value={mediaData.media_type}
                      onChange={(e) => handleMediaChange('media_type', e.target.value as StoryMediaType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">📝 Text Only</option>
                      <option value="audio">🎵 Audio Story</option>
                      <option value="video">🎥 Video Story</option>
                      <option value="mixed">🎬 Mixed Media</option>
                    </select>
                  </div>
                </div>

                {(mediaData.media_type === 'audio' || mediaData.media_type === 'mixed') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      {mediaData.audio_file && (
                        <span className="text-sm text-green-600 flex items-center">
                          <Volume2 className="w-4 h-4 mr-1" />
                          {mediaData.audio_file.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: MP3, WAV, M4A (Max 50MB)</p>
                  </div>
                )}

                {(mediaData.media_type === 'video' || mediaData.media_type === 'mixed') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      {mediaData.video_file && (
                        <span className="text-sm text-green-600 flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          {mediaData.video_file.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: MP4, WebM, MOV (Max 100MB)</p>
                  </div>
                )}

                {(mediaData.media_type === 'audio' || mediaData.media_type === 'video' || mediaData.media_type === 'mixed') && (
                  <FormField
                    label="Transcript (Optional)"
                    type="textarea"
                    value={mediaData.transcript || ''}
                    onChange={(value) => handleMediaChange('transcript', value as string)}
                    rows={4}
                    placeholder="Provide a written transcript of the audio/video content for accessibility..."
                  />
                )}
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Anonymous</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={(e) => handleInputChange('is_approved', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm text-gray-700">Approved</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSaveStory}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StoryManager;