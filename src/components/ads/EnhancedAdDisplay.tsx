import React, { useEffect, useState, useCallback } from 'react';
import { X, ExternalLink, Heart, Share2, Maximize2 } from 'lucide-react';
import { Ad, AdZone } from '../../types/ads';
import { AdManager } from '../../utils/adManager';
import {
  ModernHeroBanner,
  CardBasedAd,
  VideoAdTemplate,
  MinimalistAd,
  FullWidthBanner,
  SocialMediaAd
} from './AdTemplates';

interface EnhancedAdDisplayProps {
  zoneSlug: string;
  className?: string;
  onAdLoad?: (ad: Ad | null) => void;
  showCloseButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  template?: 'modern' | 'card' | 'video' | 'minimalist' | 'banner' | 'social' | 'auto';
  enableAnimations?: boolean;
  enableInteractions?: boolean;
  responsive?: boolean;
  maxHeight?: string;
}

const EnhancedAdDisplay: React.FC<EnhancedAdDisplayProps> = ({
  zoneSlug,
  className = '',
  onAdLoad,
  showCloseButton = false,
  autoRefresh = false,
  refreshInterval = 30000,
  template = 'auto',
  enableAnimations = true,
  enableInteractions = true,
  responsive = true,
  maxHeight = 'auto'
}) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [zone, setZone] = useState<AdZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [viewed, setViewed] = useState(false);
  const [hoverDuration, setHoverDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadAd = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch zone information
      const zoneData = await AdManager.getZoneBySlug(zoneSlug);
      setZone(zoneData);

      // Use AdManager to get ads for this zone
      const ads = await AdManager.getAdsForZone(zoneSlug, 1);
      const selectedAd = ads.length > 0 ? ads[0] : null;

      setAd(selectedAd);

      if (onAdLoad) {
        onAdLoad(selectedAd);
      }
    } catch (err) {
      console.error('Error loading ad:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ad');
    } finally {
      setLoading(false);
    }
  }, [zoneSlug, onAdLoad]);

  const getDeviceType = useCallback((): 'desktop' | 'tablet' | 'mobile' => {
    if (!responsive) return 'desktop';
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }, [responsive]);

  const trackImpression = useCallback(async () => {
    if (!ad || !zone || impressionTracked) return;

    try {
      const deviceType = getDeviceType();
      await AdManager.trackImpression(
        ad.id,
        zone.id,
        '', // TODO: Get assignment_id from ad_zone_assignments
        {
          zone_slug: zoneSlug,
          referrer: document.referrer,
          device_type: deviceType,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          template_used: template,
          animation_enabled: enableAnimations
        }
      );

      setImpressionTracked(true);
    } catch {
      console.error('Error tracking impression');
    }
  }, [ad, zone, impressionTracked, zoneSlug, template, enableAnimations, getDeviceType]);

  const trackEngagement = useCallback(async (action: string, data?: any) => {
    if (!ad || !zone) return;

    try {
      const deviceType = getDeviceType();
      await AdManager.trackClick(
        ad.id,
        zone.id,
        '',
        ad.target_url,
        {
          zone_slug: zoneSlug,
          device_type: deviceType,
          action,
          ...data
        }
      );
    } catch {
      console.error('Error tracking engagement');
    }
  }, [ad, zone, zoneSlug, getDeviceType]);

  useEffect(() => {
    loadAd();

    if (autoRefresh) {
      const interval = setInterval(loadAd, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadAd, autoRefresh, refreshInterval]);

  useEffect(() => {
    // Track impression when ad becomes visible
    if (ad && isVisible && !impressionTracked) {
      trackImpression();
    }
  }, [ad, isVisible, impressionTracked, trackImpression]);

  // Track view time
  useEffect(() => {
    if (!ad || !viewed) return;

    const startTime = Date.now();
    return () => {
      const viewTime = Date.now() - startTime;
      trackEngagement('view_time', { duration: viewTime });
    };
  }, [ad, viewed, trackEngagement]);

  const handleAdClick = async (event: React.MouseEvent) => {
    event.preventDefault();

    if (!ad || !zone) return;

    try {
      const deviceType = getDeviceType();
      await AdManager.trackClick(
        ad.id,
        zone.id,
        '',
        ad.target_url,
        {
          zone_slug: zoneSlug,
          device_type: deviceType,
          clickX: event.clientX,
          clickY: event.clientY,
          template_used: template
        }
      );

      // Open target URL
      window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    } catch {
      console.error('Error tracking click');
    }
  };

  const handleLike = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setLiked(!liked);
    trackEngagement('like', { liked: !liked });
  }, [liked, trackEngagement]);

  const handleShare = useCallback(async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad?.title,
          text: ad?.description,
          url: ad?.target_url
        });
        setShared(true);
        trackEngagement('share', { method: 'native' });
      } catch {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(ad?.target_url || '');
        setShared(true);
        trackEngagement('share', { method: 'clipboard' });
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(ad?.target_url || '');
      setShared(true);
      trackEngagement('share', { method: 'clipboard' });
    }
  }, [ad, trackEngagement]);

  const handleFullscreen = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setViewed(true);
    if (enableAnimations) {
      setHoverDuration(0);
      const interval = setInterval(() => {
        setHoverDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [enableAnimations]);

  const getDeviceOptimizedTemplate = () => {
    if (template !== 'auto') return template;
    
    const deviceType = getDeviceType();
    switch (deviceType) {
      case 'mobile':
        return 'card';
      case 'tablet':
        return 'social';
      default:
        return 'modern';
    }
  };

  const renderAdContent = () => {
    if (!ad || !zone) return null;

    const deviceTemplate = getDeviceOptimizedTemplate();
    
    const commonProps = {
      ad,
      onClick: enableInteractions ? handleAdClick : undefined,
      className: `transition-all duration-500 ${enableAnimations ? 'hover:scale-105' : ''}`,
      showAnimation: enableAnimations
    };

    switch (deviceTemplate) {
      case 'modern':
        return <ModernHeroBanner {...commonProps} />;
      case 'card':
        return <CardBasedAd {...commonProps} />;
      case 'video':
        return <VideoAdTemplate {...commonProps} />;
      case 'minimalist':
        return <MinimalistAd {...commonProps} />;
      case 'banner':
        return <FullWidthBanner {...commonProps} />;
      case 'social':
        return <SocialMediaAd {...commonProps} />;
      default:
        return <ModernHeroBanner {...commonProps} />;
    }
  };

  const renderEngagementPanel = () => {
    if (!enableInteractions || !ad) return null;

    return (
      <div className="absolute top-2 right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="bg-black/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {enableInteractions && (
          <>
            <button
              onClick={handleLike}
              className={`backdrop-blur-sm rounded-full p-2 transition-colors ${
                liked 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className={`backdrop-blur-sm rounded-full p-2 transition-colors ${
                shared 
                  ? 'bg-blue-500/80 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`${enableAnimations ? 'animate-pulse' : ''} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg h-32 ${
            enableAnimations ? 'bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]' : ''
          }`}></div>
        {enableAnimations && (
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        )}
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400">
          <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No ad available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ad-display group ${className} ${isFullscreen ? 'fixed inset-4 z-50 bg-white rounded-xl shadow-2xl overflow-auto' : ''}`}
      onMouseEnter={handleMouseEnter}
      style={{ maxHeight }}
    >
      {renderEngagementPanel()}
      
      {enableAnimations && (
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none"></div>
      )}
      
      {renderAdContent()}
      
      {/* Analytics Indicators */}
      {enableAnimations && (
        <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-xs text-white/60">
          {viewed && (
            <span className="bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
              {hoverDuration}s viewed
            </span>
          )}
          {liked && (
            <Heart className="w-3 h-3 text-red-400 fill-current" />
          )}
          {shared && (
            <Share2 className="w-3 h-3 text-blue-400" />
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedAdDisplay;