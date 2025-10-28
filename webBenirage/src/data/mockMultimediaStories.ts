import { MultimediaStory } from '../types/storytelling';

// Mock multimedia stories with simulated audio/video content
export const mockMultimediaStories: MultimediaStory[] = [
  {
    id: 'story-audio-1',
    title: 'The Wisdom of the Baobab Tree',
    content: 'In the heart of Rwanda, there stands an ancient baobab tree that has witnessed generations of our people. This is the story passed down through my family about the wisdom this tree holds...',
    author_name: 'Elder Mukamana',
    author_location: 'Nyungwe Forest, Rwanda',
    story_type: 'wisdom',
    category: 'cultural',
    is_anonymous: false,
    is_featured: true,
    is_approved: true,
    view_count: 156,
    tags: ['wisdom', 'nature', 'tradition', 'elders'],
    submitted_at: '2025-01-15T10:30:00Z',
    created_at: '2025-01-15T10:30:00Z',
    media_type: 'audio',
    audio_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC',
    audio_duration: 245, // 4 minutes 5 seconds
    transcript: `In the heart of Rwanda, there stands an ancient baobab tree that has witnessed generations of our people. The elders say this tree was planted by our ancestors when they first settled this land.

    Every evening, as the sun sets behind the hills, the baobab tree shares its wisdom with those who listen. "My roots run deep," it whispers through the wind, "deeper than the troubles that come and go."

    The young people come to sit beneath its branches, asking for guidance. "How do we preserve our traditions in a changing world?" they ask.

    The baobab answers: "Grow slowly, but steadily. Bend with the winds of change, but never break. Your branches may spread wide, but your roots must always remember where you came from."

    This is the wisdom that has sustained our community through peace and through hardship. The baobab teaches us that true strength comes not from standing rigid against the storm, but from having roots deep enough to nourish us through any season.`,
    media_metadata: {
      file_size: 5242880, // 5MB
      bitrate: 128000, // 128 kbps
      sample_rate: 44100,
      format: 'wav'
    }
  },
  {
    id: 'story-video-1',
    title: 'Traditional Intore Dance: A Living Heritage',
    content: 'The Intore dance is more than just movement - it is the heartbeat of Rwandan culture, telling stories of our warriors, our unity, and our connection to the land...',
    author_name: 'Jean Baptiste',
    author_location: 'Kigali, Rwanda',
    story_type: 'cultural',
    category: 'heritage',
    is_anonymous: false,
    is_featured: true,
    is_approved: true,
    view_count: 89,
    tags: ['dance', 'intore', 'warriors', 'tradition'],
    submitted_at: '2025-01-20T14:15:00Z',
    created_at: '2025-01-20T14:15:00Z',
    media_type: 'video',
    video_url: 'data:video/mp4;base64,AAAAHGZ0eXBtc28yYXZpczEAAAAgbmFtZV9zcGFjZQBAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACYW5jZQB',
    video_duration: 180, // 3 minutes
    thumbnail_url: '/public/intore-dancer-in-ibwiwachu-village-rwanda-CY472B.jpg',
    transcript: `The Intore dance is more than just movement - it is the heartbeat of Rwandan culture, telling stories of our warriors, our unity, and our connection to the land.

    When you watch an Intore dancer, you see the strength and grace of our ancestors. Each movement tells a story - the leap of the warrior, the sway of the tall grass, the unity of our people standing together.

    I learned Intore from my father, who learned it from his father before him. The dance connects us across generations, reminding us who we are and where we come from.

    Today, I teach young people in Kigali, making sure this beautiful tradition continues to live and breathe in our modern world.`,
    media_metadata: {
      file_size: 15728640, // 15MB
      bitrate: 1000000, // 1 Mbps
      resolution: '1920x1080',
      format: 'mp4'
    }
  },
  {
    id: 'story-mixed-1',
    title: 'Umusozi: The Hill That Whispers',
    content: 'There is a hill in our village called Umusozi - "the whispering hill." The elders say it holds the voices of our ancestors who speak to us through the wind...',
    author_name: 'Mama Amina',
    author_location: 'Musanze, Rwanda',
    story_type: 'historical',
    category: 'spiritual',
    is_anonymous: false,
    is_featured: false,
    is_approved: true,
    view_count: 67,
    tags: ['ancestors', 'spirituality', 'nature', 'whispers'],
    submitted_at: '2025-01-25T09:45:00Z',
    created_at: '2025-01-25T09:45:00Z',
    media_type: 'mixed',
    audio_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC',
    video_url: 'data:video/mp4;base64,AAAAHGZ0eXBtc28yYXZpczEAAAAgbmFtZV9zcGFjZQBAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACYW5jZQB',
    audio_duration: 312, // 5 minutes 12 seconds
    video_duration: 120, // 2 minutes
    thumbnail_url: '/public/urusengo.jpeg',
    transcript: `There is a hill in our village called Umusozi - "the whispering hill." The elders say it holds the voices of our ancestors who speak to us through the wind.

    When I was a young girl, my grandmother would take me to this hill at dawn. "Listen carefully," she would say, "the ancestors are speaking to you."

    At first, I heard only the wind rustling through the banana leaves. But as I grew older, I began to understand the messages - warnings about coming rains, guidance about planting seasons, comfort during times of sorrow.

    The hill taught me that our ancestors are never truly gone. They live on in the land, in the wind, in the stories we tell. They whisper to us if only we learn to listen.

    Today, I take my own grandchildren to Umusozi, teaching them to hear the voices of those who came before us.`,
    media_metadata: {
      file_size: 20971520, // 20MB total
      bitrate: 128000,
      resolution: '1280x720',
      sample_rate: 44100,
      format: 'mp4+wav'
    }
  },
  {
    id: 'story-audio-2',
    title: 'The Art of Rwandan Basket Weaving',
    content: 'Basket weaving in Rwanda is not just a craft - it is a conversation between the weaver, the materials, and the generations who have passed this knowledge down...',
    author_name: 'Sister Marie-Claire',
    author_location: 'Gisagara, Rwanda',
    story_type: 'cultural',
    category: 'heritage',
    is_anonymous: false,
    is_featured: false,
    is_approved: true,
    view_count: 43,
    tags: ['crafts', 'weaving', 'tradition', 'women'],
    submitted_at: '2025-02-01T16:20:00Z',
    created_at: '2025-02-01T16:20:00Z',
    media_type: 'audio',
    audio_url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC',
    audio_duration: 198, // 3 minutes 18 seconds
    transcript: `Basket weaving in Rwanda is not just a craft - it is a conversation between the weaver, the materials, and the generations who have passed this knowledge down.

    My hands remember what my grandmother taught me. The way the sisal fibers feel between my fingers, the rhythm of weaving that matches the beating of my heart, the patterns that tell stories of our people.

    Each basket carries a piece of our history. The tight weave speaks of unity, the colored patterns tell of our hills and valleys, the strength of the finished work reminds us of the resilience of Rwandan women.

    When I teach young girls to weave, I tell them: "You are not just making a basket. You are weaving together the past, present, and future of our people."`,
    media_metadata: {
      file_size: 4194304, // 4MB
      bitrate: 128000,
      sample_rate: 44100,
      format: 'wav'
    }
  },
  {
    id: 'story-video-2',
    title: 'Morning Coffee Ceremony in Rwandan Culture',
    content: 'In Rwanda, sharing coffee is not just about the drink - it is a ritual of connection, conversation, and community that brings people together...',
    author_name: 'Emmanuel Nkurunziza',
    author_location: 'Huye, Rwanda',
    story_type: 'cultural',
    category: 'community',
    is_anonymous: false,
    is_featured: false,
    is_approved: true,
    view_count: 28,
    tags: ['coffee', 'ceremony', 'community', 'hospitality'],
    submitted_at: '2025-02-05T11:10:00Z',
    created_at: '2025-02-05T11:10:00Z',
    media_type: 'video',
    video_url: 'data:video/mp4;base64,AAAAHGZ0eXBtc28yYXZpczEAAAAgbmFtZV9zcGFjZQBAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACAAACYW5jZQB',
    video_duration: 156, // 2 minutes 36 seconds
    thumbnail_url: '/public/imyambi.jpeg',
    transcript: `In Rwanda, sharing coffee is not just about the drink - it is a ritual of connection, conversation, and community that brings people together.

    The coffee ceremony begins before dawn, when the beans are carefully selected and roasted over an open fire. The aroma fills the air, calling neighbors to gather.

    As we sit together, pouring the rich coffee into small cups, we share not just the drink but our stories, our hopes, our concerns. The coffee warms our bodies, but the conversation warms our souls.

    This tradition has sustained our communities through good times and difficult times. It reminds us that we are stronger together, that every voice matters, that hospitality is the foundation of Rwandan culture.`,
    media_metadata: {
      file_size: 12582912, // 12MB
      bitrate: 1000000,
      resolution: '1920x1080',
      format: 'mp4'
    }
  }
];

// Helper function to get featured multimedia stories
export const getFeaturedMultimediaStories = (): MultimediaStory[] => {
  return mockMultimediaStories.filter(story => story.is_featured);
};

// Helper function to get stories by media type
export const getStoriesByMediaType = (mediaType: 'audio' | 'video' | 'mixed' | 'text'): MultimediaStory[] => {
  if (mediaType === 'text') {
    return mockMultimediaStories.filter(story => !story.media_type || story.media_type === 'text');
  }
  return mockMultimediaStories.filter(story => story.media_type === mediaType);
};

// Helper function to search multimedia stories
export const searchMultimediaStories = (query: string): MultimediaStory[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockMultimediaStories.filter(story =>
    story.title.toLowerCase().includes(lowercaseQuery) ||
    story.content.toLowerCase().includes(lowercaseQuery) ||
    story.author_name.toLowerCase().includes(lowercaseQuery) ||
    story.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};