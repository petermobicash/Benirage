// Enhanced storytelling types with multimedia support
export interface MultimediaStory {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_email?: string;
  author_location?: string;
  story_type: 'personal' | 'family' | 'cultural' | 'historical' | 'wisdom' | 'other';
  category: 'spiritual' | 'cultural' | 'philosophical' | 'community' | 'personal_growth' | 'heritage' | 'other';
  is_anonymous: boolean;
  is_featured: boolean;
  is_approved: boolean;
  view_count: number;
  tags: string[];
  submitted_at: string;
  created_at: string;

  // Multimedia fields
  media_type?: 'text' | 'audio' | 'video' | 'mixed';
  audio_url?: string;
  video_url?: string;
  audio_duration?: number; // in seconds
  video_duration?: number; // in seconds
  transcript?: string; // for audio/video content
  thumbnail_url?: string;
  media_metadata?: {
    file_size?: number;
    bitrate?: number;
    resolution?: string; // for video
    sample_rate?: number; // for audio
    format?: string;
  };
}

export interface StoryFormData {
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_location: string;
  story_type: string;
  category: string;
  is_anonymous: boolean;
  tags: string;

  // Multimedia fields
  media_type?: 'text' | 'audio' | 'video' | 'mixed';
  audio_file?: File;
  video_file?: File;
  transcript?: string;
}

export interface AudioVisualizationData {
  duration: number;
  waveform?: number[]; // Array of amplitude values for visualization
  peaks?: { time: number; amplitude: number }[];
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error?: string;
}

export type StoryMediaType = 'text' | 'audio' | 'video' | 'mixed';

export interface StoryFilters {
  searchTerm: string;
  typeFilter: string;
  categoryFilter: string;
  mediaTypeFilter: StoryMediaType | 'all';
}