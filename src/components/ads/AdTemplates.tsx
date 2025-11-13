import React from 'react';
import { Ad } from '../../types/ads';
import { ExternalLink, Star, Zap, Heart, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AdTemplatesProps {
  ad: Ad;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  showAnimation?: boolean;
}

// Template 1: Modern Hero Banner
export const ModernHeroBanner: React.FC<AdTemplatesProps> = ({ 
  ad, 
  onClick, 
  className = '', 
  showAnimation = true 
}) => (
  <div 
    className={`group relative overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 ${className}`}
    onClick={onClick}
  >
    <div className="relative bg-gradient-to-br from-brand-main via-brand-accent to-brand-main-400 p-8 text-white">
      {showAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-sm font-medium opacity-90">Featured</span>
          </div>
          <ExternalLink className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <h3 className="text-2xl font-bold mb-3 leading-tight">{ad.title}</h3>
        <p className="text-lg opacity-90 mb-6 leading-relaxed">{ad.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {ad.content_url && (
              <img 
                src={ad.content_url} 
                alt={ad.alt_text || ad.title}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
            )}
            <div>
              <p className="font-semibold text-sm">Sponsored</p>
              <p className="text-xs opacity-75">{ad.advertiser?.company_name}</p>
            </div>
          </div>
          
          <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Template 2: Card-based Ad
export const CardBasedAd: React.FC<AdTemplatesProps> = ({ 
  ad, 
  onClick, 
  className = '', 
  showAnimation = true 
}) => (
  <div 
    className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
    onClick={onClick}
  >
    <div className="relative">
      {ad.content_url && (
        <div className={`relative overflow-hidden ${showAnimation ? 'group-hover:scale-110' : ''} transition-transform duration-500`}>
          <img 
            src={ad.content_url} 
            alt={ad.alt_text || ad.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
    
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {ad.ad_type.toUpperCase()}
        </span>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Zap className="w-3 h-3" />
          <span>Premium</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{ad.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{ad.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {ad.advertiser?.company_name?.charAt(0) || 'A'}
            </span>
          </div>
          <span className="text-sm text-gray-500">{ad.advertiser?.company_name}</span>
        </div>
        
        <button className="bg-gradient-to-r from-brand-accent to-brand-accent-400 hover:from-brand-accent-600 hover:to-brand-accent-500 text-brand-main px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
          Explore
        </button>
      </div>
    </div>
  </div>
);

// Template 3: Video Ad Template
export const VideoAdTemplate: React.FC<Omit<AdTemplatesProps, 'showAnimation'>> = ({
  ad,
  onClick,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {ad.content_url && (
        <div className="relative">
          <video 
            className="w-full h-64 object-cover"
            muted={isMuted}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={ad.content_url} type="video/mp4" />
            Your browser does not support video playback.
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
              {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
            </button>
          </div>
          
          {/* Video Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="bg-black/20 backdrop-blur-sm rounded-full p-2 hover:bg-black/30 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Add to wishlist functionality
              }}
              className="bg-black/20 backdrop-blur-sm rounded-full p-2 hover:bg-black/30 transition-colors"
            >
              <Heart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
        <p className="text-sm opacity-90 mb-3">{ad.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-75">Sponsored by {ad.advertiser?.company_name}</span>
          <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-1 rounded-lg text-sm font-medium transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// Template 4: Minimalist Text Ad
export const MinimalistAd: React.FC<Omit<AdTemplatesProps, 'showAnimation'>> = ({
  ad,
  onClick,
  className = ''
}) => (
  <div 
    className={`group relative bg-white border-l-4 border-blue-500 p-6 hover:shadow-lg transition-all duration-300 ${className}`}
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      {ad.content_url && (
        <img 
          src={ad.content_url} 
          alt={ad.alt_text || ad.title}
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{ad.title}</h3>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ad.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {ad.advertiser?.company_name?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="text-xs text-gray-500">{ad.advertiser?.company_name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Template 5: Full-width Banner
export const FullWidthBanner: React.FC<Omit<AdTemplatesProps, 'showAnimation'>> = ({
  ad,
  onClick,
  className = ''
}) => (
  <div 
    className={`group relative overflow-hidden ${className}`}
    onClick={onClick}
  >
    {ad.content_url ? (
      <div className="relative">
        <img 
          src={ad.content_url} 
          alt={ad.alt_text || ad.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
      </div>
    ) : (
      <div className="w-full h-32 bg-gradient-to-r from-brand-accent to-brand-accent-400"></div>
    )}
    
    <div className="absolute inset-0 flex items-center">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
            <p className="text-lg opacity-90">{ad.description}</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Template 6: Social Media Style
export const SocialMediaAd: React.FC<Omit<AdTemplatesProps, 'showAnimation'>> = ({
  ad,
  onClick,
  className = ''
}) => (
  <div 
    className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
    onClick={onClick}
  >
    {/* Header */}
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {ad.advertiser?.company_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{ad.advertiser?.company_name}</p>
            <p className="text-xs text-gray-500">Sponsored</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
    
    {/* Content */}
    <div className="p-4">
      <h3 className="font-bold text-lg text-gray-900 mb-2">{ad.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{ad.description}</p>
      
      {ad.content_url && (
        <div className="mb-4">
          <img 
            src={ad.content_url} 
            alt={ad.alt_text || ad.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
    
    {/* Actions */}
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs">Like</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </button>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Learn More
        </button>
      </div>
    </div>
  </div>
);

export default {
  ModernHeroBanner,
  CardBasedAd,
  VideoAdTemplate,
  MinimalistAd,
  FullWidthBanner,
  SocialMediaAd
};