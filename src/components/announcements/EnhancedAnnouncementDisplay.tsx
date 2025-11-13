import React, { useEffect, useState, useCallback } from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Announcement } from '../../types/announcements';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import {
  ModernTopBanner,
  CardAnnouncement,
  FloatingActionBar,
  SidebarPanel,
  CompactNotification
} from './AnnouncementTemplates';

interface EnhancedAnnouncementDisplayProps {
  template?: 'banner' | 'card' | 'floating' | 'sidebar' | 'compact' | 'auto';
  position?: 'top' | 'left' | 'right' | 'bottom' | 'floating';
  maxVisible?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
  enableAnimations?: boolean;
  enableInteractions?: boolean;
  responsive?: boolean;
  onAnnouncementView?: (announcement: Announcement) => void;
  onAnnouncementDismiss?: (announcement: Announcement) => void;
  onAnnouncementAction?: (announcement: Announcement, action: 'primary' | 'secondary') => void;
  className?: string;
}

const EnhancedAnnouncementDisplay: React.FC<EnhancedAnnouncementDisplayProps> = ({
  template = 'auto',
  position = 'top',
  maxVisible = 3,
  autoHide = false,
  autoHideDelay = 5000,
  enableAnimations = true,
  enableInteractions = true,
  responsive = true,
  onAnnouncementView,
  onAnnouncementDismiss,
  onAnnouncementAction,
  className = ''
}) => {
  const { announcements, dismissAnnouncement } = useAnnouncements();
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [autoHideTimeouts, setAutoHideTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Get device type for responsive design
  const getDeviceType = useCallback((): 'desktop' | 'tablet' | 'mobile' => {
    if (!responsive) return 'desktop';
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }, [responsive]);

  // Auto-select template based on device and position
  const getAutoTemplate = useCallback((): string => {
    if (template !== 'auto') return template;
    
    const deviceType = getDeviceType();
    
    // Template selection logic
    if (position === 'floating' || (position === 'top' && deviceType === 'mobile')) {
      return 'floating';
    }
    
    if (position === 'left' || position === 'right') {
      return deviceType === 'mobile' ? 'compact' : 'sidebar';
    }
    
    if (position === 'bottom') {
      return deviceType === 'mobile' ? 'compact' : 'floating';
    }
    
    // Default to banner for top position
    return 'banner';
  }, [template, position, getDeviceType]);

  // Track announcement view
  const handleView = useCallback((announcement: Announcement) => {
    if (!viewedIds.has(announcement.id)) {
      setViewedIds(prev => new Set([...prev, announcement.id]));
      onAnnouncementView?.(announcement);
    }
  }, [viewedIds, onAnnouncementView]);

  // Handle announcement dismissal
  const handleDismiss = useCallback((announcementId: string) => {
    setDismissedIds(prev => new Set([...prev, announcementId]));
    
    // Clear auto-hide timeout if exists
    const timeout = autoHideTimeouts.get(announcementId);
    if (timeout) {
      clearTimeout(timeout);
      setAutoHideTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(announcementId);
        return newMap;
      });
    }
    
    // Call dismiss callback
    dismissAnnouncement(announcementId);
    
    // Find announcement and call dismiss callback
    const announcement = announcements.find(a => a.id === announcementId);
    if (announcement) {
      onAnnouncementDismiss?.(announcement);
    }
  }, [announcements, dismissAnnouncement, onAnnouncementDismiss, autoHideTimeouts]);

  // Handle announcement action
  const handleAction = useCallback((announcement: Announcement, action: 'primary' | 'secondary') => {
    onAnnouncementAction?.(announcement, action);
    
    // Track engagement
    if (enableInteractions) {
      // Track social interactions
      if (action === 'primary' && announcement.actions?.primary?.url) {
        // Handle external link
        window.open(announcement.actions.primary.url, '_blank', 'noopener,noreferrer');
      }
      
      if (action === 'secondary' && announcement.actions?.secondary?.url) {
        // Handle secondary action
        window.open(announcement.actions.secondary.url, '_blank', 'noopener,noreferrer');
      }
    }
  }, [onAnnouncementAction, enableInteractions]);

  // Handle social interactions
  const handleLike = useCallback((announcementId: string) => {
    setLikedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback(async (announcementId: string) => {
    const announcement = announcements.find(a => a.id === announcementId);
    if (!announcement) return;
    
    const shareData = {
      title: announcement.title,
      text: announcement.message,
      url: window.location.href
    };
    
    try {
      if (navigator.share && enableInteractions) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareData.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn('Failed to share announcement:', err);
    }
  }, [announcements, enableInteractions]);

  // Update visible announcements
  useEffect(() => {
    const filtered = announcements
      .filter(announcement => !dismissedIds.has(announcement.id))
      .slice(0, maxVisible);
    
    setVisibleAnnouncements(filtered);
  }, [announcements, dismissedIds, maxVisible]);

  // Track views for visible announcements
  useEffect(() => {
    visibleAnnouncements.forEach(announcement => {
      if (!viewedIds.has(announcement.id)) {
        handleView(announcement);
      }
    });
  }, [visibleAnnouncements, viewedIds, handleView]);

  // Auto-hide setup
  useEffect(() => {
    if (autoHide && enableAnimations) {
      setAutoHideTimeouts(prev => {
        const newMap = new Map(prev);
        
        // Clear existing timeouts for announcements no longer visible
        prev.forEach((timeout, id) => {
          if (!visibleAnnouncements.find(a => a.id === id)) {
            clearTimeout(timeout);
            newMap.delete(id);
          }
        });
        
        // Add timeouts for new visible announcements
        visibleAnnouncements.forEach(announcement => {
          if (!newMap.has(announcement.id)) {
            const timeout = setTimeout(() => {
              handleDismiss(announcement.id);
            }, autoHideDelay);
            newMap.set(announcement.id, timeout);
          }
        });
        
        return newMap;
      });
    }
  }, [autoHide, enableAnimations, visibleAnnouncements, autoHideDelay, handleDismiss]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      autoHideTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [autoHideTimeouts]);

  // Render announcement based on template and position
  const renderAnnouncement = useCallback((announcement: Announcement, index: number) => {
    const template = getAutoTemplate();
    const isLiked = likedIds.has(announcement.id);
    
    const commonProps = {
      key: announcement.id,
      announcement,
      onDismiss: () => handleDismiss(announcement.id),
      onAction: (action: 'primary' | 'secondary') => handleAction(announcement, action),
      showAnimation: enableAnimations,
      className: `${className} ${index > 0 ? 'mt-2' : ''}`
    };

    // Add social interaction buttons for interactive templates
    const renderSocialActions = () => {
      if (!enableInteractions || template === 'banner') return null;
      
      return (
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={() => handleLike(announcement.id)}
            className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full transition-colors ${
              isLiked 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button
            onClick={() => handleShare(announcement.id)}
            className="flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>
      );
    };

    // Position-specific rendering
    const getPositionedTemplate = () => {
      const templateProps = {
        ...commonProps,
        position,
        index
      };

      switch (template) {
        case 'banner':
          return <ModernTopBanner {...templateProps} />;
        case 'card':
          return <CardAnnouncement {...templateProps} />;
        case 'floating':
          return <FloatingActionBar {...templateProps} />;
        case 'sidebar':
          return <SidebarPanel {...templateProps} />;
        case 'compact':
          return <CompactNotification {...templateProps} />;
        default:
          // Auto-select based on context
          if (position === 'top' || position === 'bottom') {
            return <ModernTopBanner {...templateProps} />;
          } else if (position === 'floating') {
            return <FloatingActionBar {...templateProps} />;
          } else {
            return <CardAnnouncement {...templateProps} />;
          }
      }
    };

    return (
      <div className="relative">
        {getPositionedTemplate()}
        {renderSocialActions()}
      </div>
    );
  }, [
    likedIds,
    position,
    enableAnimations,
    enableInteractions,
    className,
    handleDismiss,
    handleAction,
    handleLike,
    handleShare,
    getAutoTemplate
  ]);

  // Render all visible announcements
  return (
    <div className={`announcement-display ${className}`}>
      {visibleAnnouncements.map((announcement, index) => 
        renderAnnouncement(announcement, index)
      )}
    </div>
  );
};

export default EnhancedAnnouncementDisplay;