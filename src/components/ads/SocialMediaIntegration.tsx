import React, { useState, useCallback } from 'react';
import {
  Facebook, Twitter, Instagram, Linkedin, Share2, Heart,
  MessageCircle, Send, Copy, ExternalLink, Check, Users,
  TrendingUp, Clock, Filter, BarChart3, AlertCircle
} from 'lucide-react';
import { Ad } from '../../types/ads';

interface SocialMediaIntegrationProps {
  ad: Ad;
  className?: string;
  showAnalytics?: boolean;
  platforms?: ('facebook' | 'twitter' | 'instagram' | 'linkedin')[];
  onShare?: (platform: string, data: any) => void;
}

interface SocialMetrics {
  platform: string;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  impressions: number;
  engagementRate: number;
  reach: number;
}

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  status: 'published' | 'scheduled' | 'draft';
}

const SocialMediaIntegration: React.FC<SocialMediaIntegrationProps> = ({
  ad,
  className = '',
  showAnalytics = true,
  platforms = ['facebook', 'twitter', 'instagram', 'linkedin'],
  onShare
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'analytics' | 'posts'>('compose');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  // Mock data - Using consistent lowercase platform names
  const socialMetrics: SocialMetrics[] = [
    { platform: 'facebook', likes: 245, shares: 89, comments: 34, clicks: 156, impressions: 1240, engagementRate: 4.2, reach: 890 },
    { platform: 'twitter', likes: 180, shares: 120, comments: 67, clicks: 203, impressions: 980, engagementRate: 3.8, reach: 720 },
    { platform: 'instagram', likes: 320, shares: 45, comments: 78, clicks: 89, impressions: 1100, engagementRate: 5.1, reach: 650 },
    { platform: 'linkedin', likes: 156, shares: 34, comments: 23, clicks: 78, impressions: 650, engagementRate: 3.4, reach: 420 }
  ];

  const socialPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'facebook',
      content: `Check out this amazing opportunity: ${ad.title} - ${ad.description}`,
      imageUrl: ad.content_url,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      engagement: { likes: 45, shares: 12, comments: 8 },
      status: 'published'
    },
    {
      id: '2',
      platform: 'twitter',
      content: `🚀 ${ad.title}\n\n${ad.description}\n\n#business #opportunity`,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      engagement: { likes: 23, shares: 8, comments: 3 },
      status: 'published'
    }
  ];

  const platformIcons: Record<string, React.ComponentType<any>> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin
  };

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-600 hover:bg-blue-700',
    twitter: 'bg-sky-500 hover:bg-sky-600',
    instagram: 'bg-pink-600 hover:bg-pink-700',
    linkedin: 'bg-blue-700 hover:bg-blue-800'
  };

  const handleShare = useCallback(async (platform: string) => {
    setIsSharing(true);
    setShareStatus(prev => ({ ...prev, [platform]: 'idle' }));

    try {
      const shareData = {
        title: ad.title,
        text: ad.description,
        url: ad.target_url,
        image: ad.content_url
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Platform-specific sharing logic
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ad.target_url)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(ad.target_url)}&text=${encodeURIComponent(ad.title)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ad.target_url)}`, '_blank');
          break;
        case 'instagram':
          // Instagram doesn't support direct sharing via web, so copy to clipboard
          await navigator.clipboard.writeText(`${ad.title} - ${ad.target_url}`);
          break;
        default:
          // Native Web Share API
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(`${ad.title} - ${ad.target_url}`);
          }
      }

      setShareStatus(prev => ({ ...prev, [platform]: 'success' }));
      onShare?.(platform, { ad, shareData });

      // Reset status after 3 seconds
      setTimeout(() => {
        setShareStatus(prev => ({ ...prev, [platform]: 'idle' }));
      }, 3000);

    } catch (error) {
      console.error('Error sharing:', error);
      setShareStatus(prev => ({ ...prev, [platform]: 'error' }));
      // Reset error status after 3 seconds
      setTimeout(() => {
        setShareStatus(prev => ({ ...prev, [platform]: 'idle' }));
      }, 3000);
    } finally {
      setIsSharing(false);
    }
  }, [ad, onShare]);

  const handleBulkShare = useCallback(async () => {
    for (const platform of selectedPlatforms) {
      await handleShare(platform);
    }
  }, [selectedPlatforms, handleShare]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied to clipboard!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyFeedback('Failed to copy to clipboard');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  }, []);

  const renderComposeTab = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share to Social Media</h3>
          {copyFeedback && (
            <div className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-full ${
              copyFeedback.includes('Failed')
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {copyFeedback.includes('Failed') ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{copyFeedback}</span>
            </div>
          )}
        </div>
        
        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform];
              const isSelected = selectedPlatforms.includes(platform);
              
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    setSelectedPlatforms(prev =>
                      prev.includes(platform)
                        ? prev.filter(p => p !== platform)
                        : [...prev, platform]
                    );
                  }}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Deselect' : 'Select'} ${platform} platform`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="capitalize font-medium">{platform}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ad Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Ad Preview</h4>
          <div className="bg-white rounded-lg p-4 border">
            <h5 className="font-semibold text-gray-900">{ad.title}</h5>
            <p className="text-gray-600 text-sm mt-1">{ad.description}</p>
            {ad.content_url && (
              <img 
                src={ad.content_url} 
                alt={ad.alt_text || ad.title}
                className="w-full h-32 object-cover rounded mt-3"
              />
            )}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleBulkShare}
            disabled={selectedPlatforms.length === 0 || isSharing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
          >
            {isSharing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" aria-label="Sharing..."></div>
            ) : (
              <Share2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Share to Selected Platforms</span>
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {selectedPlatforms.map((platform) => {
              const Icon = platformIcons[platform];
              const status = shareStatus[platform];
              
              return (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={isSharing}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${
                    platformColors[platform]
                  } ${isSharing ? 'opacity-50' : ''}`}
                  type="button"
                  aria-label={`Share to ${platform}`}
                >
                  {status === 'success' ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span className="capitalize">{platform}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Social Media Analytics</h3>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select className="border border-gray-200 rounded px-3 py-1 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">2.6K</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">4.1%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shares</p>
              <p className="text-2xl font-bold text-gray-900">288</p>
            </div>
            <Share2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clicks</p>
              <p className="text-2xl font-bold text-gray-900">526</p>
            </div>
            <ExternalLink className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Platform Analytics */}
      <div className="space-y-4">
        {socialMetrics.map((metric) => {
          const Icon = platformIcons[metric.platform as keyof typeof platformIcons];
          
          return (
            <div key={metric.platform} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {Icon ? <Icon className="w-5 h-5 text-gray-600" /> : <div className="w-5 h-5 bg-gray-300 rounded" />}
                  <h4 className="font-medium text-gray-900 capitalize">{metric.platform}</h4>
                </div>
                <span className="text-sm text-gray-500">{metric.engagementRate}% engagement</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.likes}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.shares}</p>
                  <p className="text-xs text-gray-500">Shares</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.comments}</p>
                  <p className="text-xs text-gray-500">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{metric.reach}</p>
                  <p className="text-xs text-gray-500">Reach</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPostsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Published Posts</h3>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Post
        </button>
      </div>

      <div className="space-y-4">
        {socialPosts.map((post) => {
          const Icon = platformIcons[post.platform as keyof typeof platformIcons];
          
          return (
            <div key={post.id} className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {Icon ? <Icon className="w-5 h-5 text-gray-600" /> : <div className="w-5 h-5 bg-gray-300 rounded" />}
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{post.platform}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(post.timestamp).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(post.content)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
                    type="button"
                    aria-label="Copy post content to clipboard"
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{post.content}</p>
              
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt="Post content"
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.engagement.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>{post.engagement.shares}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.engagement.comments}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const tabs = [
    { id: 'compose', label: 'Compose', icon: Send },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'posts', label: 'Posts', icon: MessageCircle }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Social Media Integration</h2>
        <p className="text-gray-600">Share your ads across social platforms and track performance</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                type="button"
                aria-pressed={activeTab === tab.id}
                aria-label={`Switch to ${tab.label} tab`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'compose' && renderComposeTab()}
        {activeTab === 'analytics' && showAnalytics && renderAnalyticsTab()}
        {activeTab === 'posts' && renderPostsTab()}
      </div>
    </div>
  );
};

export default SocialMediaIntegration;