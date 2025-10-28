import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Coffee, Users, Smartphone, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Announcement } from '../../types/announcements';

interface TopBannerProps {
  announcements: Announcement[];
  onDismiss: (id: string) => void;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
}

const TopBanner = ({ announcements, onDismiss, deviceType = 'desktop' }: TopBannerProps) => {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);
  const [autoHideTimers, setAutoHideTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Icon mapping
  const getIcon = (iconName?: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Heart,
      Coffee,
      Users,
      Smartphone,
      AlertTriangle,
      Info,
      CheckCircle,
      AlertCircle
    };
    return iconMap[iconName || 'Info'] || Info;
  };

  const setupAutoHideTimers = useCallback(() => {
    announcements.forEach(announcement => {
      if (announcement.autoHide && announcement.autoHideDelay && !autoHideTimers.has(announcement.id)) {
        const timer = setTimeout(() => {
          onDismiss(announcement.id);
        }, announcement.autoHideDelay * 1000);

        setAutoHideTimers(prev => new Map(prev.set(announcement.id, timer)));
      }
    });

    return () => {
      autoHideTimers.forEach(timer => clearTimeout(timer));
    };
  }, [announcements, onDismiss, autoHideTimers]);

  // Auto-hide functionality
  useEffect(() => {
    const cleanup = setupAutoHideTimers();
    return cleanup;
  }, [setupAutoHideTimers]);

  // Update visible announcements when announcements prop changes
  useEffect(() => {
    setVisibleAnnouncements(announcements);
  }, [announcements]);

  // Type-based styling
  const getTypeStyles = (type: Announcement['type']) => {
    const styles = {
      info: 'bg-blue-600 text-white',
      warning: 'bg-yellow-500 text-yellow-900',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      promotion: 'bg-purple-600 text-white'
    };
    return styles[type] || styles.info;
  };

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {visibleAnnouncements.map((announcement) => {
        const IconComponent = getIcon(announcement.styling?.icon);
        const typeStyles = getTypeStyles(announcement.type);

        return (
          <div
            key={announcement.id}
            className={`
              ${typeStyles}
              ${deviceType === 'mobile' ? 'mx-2' : ''}
              relative overflow-hidden shadow-lg transition-all duration-300 ease-in-out
              ${announcement.dismissible ? 'pr-12' : ''}
            `}
            style={{
              background: announcement.styling?.backgroundColor || undefined,
              color: announcement.styling?.textColor || undefined
            }}
          >
            {/* Animated background gradient for visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50"></div>

            <div className={`relative px-4 py-3 ${deviceType === 'mobile' ? 'px-3 py-2' : 'px-6 py-4'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {announcement.styling?.icon && (
                    <IconComponent className={`flex-shrink-0 ${deviceType === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  )}

                  <div className="flex-1 min-w-0">
                    {announcement.title && (
                      <h3 className={`font-semibold truncate ${deviceType === 'mobile' ? 'text-sm' : 'text-base'}`}>
                        {announcement.title}
                      </h3>
                    )}
                    <p className={`mt-1 truncate ${deviceType === 'mobile' ? 'text-xs' : 'text-sm'} opacity-90`}>
                      {announcement.message}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {announcement.actions?.primary && (
                    <a
                      href={announcement.actions.primary.url}
                      onClick={announcement.actions.primary.onClick}
                      className={`
                        ${deviceType === 'mobile' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}
                        bg-white/20 hover:bg-white/30 rounded-md font-medium transition-colors duration-200
                        ${deviceType === 'mobile' ? 'min-h-[32px]' : ''}
                      `}
                    >
                      {announcement.actions.primary.label}
                    </a>
                  )}

                  {announcement.actions?.secondary && (
                    <a
                      href={announcement.actions.secondary.url}
                      onClick={announcement.actions.secondary.onClick}
                      className={`
                        ${deviceType === 'mobile' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'}
                        bg-white/10 hover:bg-white/20 rounded-md font-medium transition-colors duration-200
                        ${deviceType === 'mobile' ? 'min-h-[32px]' : ''}
                      `}
                    >
                      {announcement.actions.secondary.label}
                    </a>
                  )}

                  {announcement.dismissible && (
                    <button
                      onClick={() => onDismiss(announcement.id)}
                      className={`
                        ${deviceType === 'mobile' ? 'p-1' : 'p-2'}
                        hover:bg-white/20 rounded-full transition-colors duration-200
                        ${deviceType === 'mobile' ? 'min-w-[32px] min-h-[32px]' : ''}
                      `}
                      aria-label="Dismiss announcement"
                    >
                      <X className={`${deviceType === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar for auto-hide announcements */}
              {announcement.autoHide && announcement.autoHideDelay && (
                <div className={`mt-2 bg-black/20 rounded-full h-1 ${deviceType === 'mobile' ? 'h-0.5' : ''}`}>
                  <div
                    className="bg-white/60 h-full rounded-full animate-pulse"
                    style={{
                      animationDuration: `${announcement.autoHideDelay}s`,
                      animationTimingFunction: 'linear'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopBanner;