import React from 'react';
import { Announcement } from '../../types/announcements';
import { X, Info, AlertTriangle, CheckCircle, XCircle, Gift, Star, Clock, ExternalLink } from 'lucide-react';

interface AnnouncementTemplatesProps {
  announcement: Announcement;
  onDismiss?: () => void;
  onAction?: (action: 'primary' | 'secondary') => void;
  className?: string;
  showAnimation?: boolean;
  compact?: boolean;
}

// Template 1: Modern Top Banner
export const ModernTopBanner: React.FC<AnnouncementTemplatesProps> = ({ 
  announcement, 
  onDismiss, 
  onAction, 
  className = '', 
  showAnimation = true,
  compact = false 
}) => (
  <div 
    className={`relative overflow-hidden ${showAnimation ? 'animate-slide-down' : ''} ${className}`}
    style={{
      background: announcement.styling?.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: announcement.styling?.textColor || '#ffffff'
    }}
  >
    {showAnimation && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-shimmer" />
    )}
    
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getIcon(announcement.type, announcement.styling?.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{announcement.title}</h3>
            {!compact && (
              <p className="text-xs opacity-90 mt-0.5 line-clamp-2">{announcement.message}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {announcement.actions?.primary && (
            announcement.actions.primary.url ? (
              <a
                href={announcement.actions.primary.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={announcement.actions.primary.onClick}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105 inline-block"
              >
                {announcement.actions.primary.label}
              </a>
            ) : (
              <button
                onClick={() => {
                  announcement.actions?.primary?.onClick?.();
                  onAction?.('primary');
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105"
              >
                {announcement.actions.primary.label}
              </button>
            )
          )}
          
          {announcement.dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
    
    <style>{`
      @keyframes slide-down {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%) skewX(-12deg); }
        100% { transform: translateX(200%) skewX(-12deg); }
      }
      .animate-slide-down { 
        animation: slide-down 0.5s ease-out; 
      }
      .animate-shimmer { 
        animation: shimmer 2s infinite; 
      }
    `}</style>
  </div>
);

// Template 2: Card-based Announcement
export const CardAnnouncement: React.FC<AnnouncementTemplatesProps> = ({
  announcement,
  onDismiss,
  onAction,
  className = '',
  showAnimation = true,
  compact = false
}) => (
  <div
    className={`group relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${showAnimation ? 'hover:scale-105' : ''} ${className}`}
    style={{
      borderLeftColor: announcement.styling?.borderColor || '#3b82f6',
      borderLeftWidth: '4px'
    }}
  >
    <div className={compact ? "p-4" : "p-6"}>
      <div className={`flex items-start justify-between ${compact ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: getTypeColor(announcement.type) + '20' }}>
            {getIcon(announcement.type, announcement.styling?.icon, getTypeColor(announcement.type))}
          </div>
          <div>
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>{announcement.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" 
                style={{ 
                  backgroundColor: getTypeColor(announcement.type) + '20', 
                  color: getTypeColor(announcement.type) 
                }}
              >
                {announcement.priority.toUpperCase()}
              </span>
              {announcement.endDate && (
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeRemaining(announcement.endDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {announcement.dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className={`text-gray-600 leading-relaxed mb-6 ${compact ? 'text-sm line-clamp-2' : ''}`}>
        {announcement.message}
      </p>
      
      {announcement.actions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {announcement.actions.secondary && (
              announcement.actions.secondary.url ? (
                <a
                  href={announcement.actions.secondary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={announcement.actions.secondary.onClick}
                  className={`text-gray-600 hover:text-gray-800 ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors inline-block`}
                >
                  {announcement.actions.secondary.label}
                </a>
              ) : (
                <button
                  onClick={() => {
                    announcement.actions?.secondary?.onClick?.();
                    onAction?.('secondary');
                  }}
                  className={`text-gray-600 hover:text-gray-800 ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors`}
                >
                  {announcement.actions.secondary.label}
                </button>
              )
            )}
          </div>
          
          {announcement.actions.primary && (
            announcement.actions.primary.url ? (
              <a
                href={announcement.actions.primary.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={announcement.actions.primary.onClick}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-colors hover:scale-105 transform inline-block`}
              >
                {announcement.actions.primary.label}
              </a>
            ) : (
              <button
                onClick={() => {
                  announcement.actions?.primary?.onClick?.();
                  onAction?.('primary');
                }}
                className={`bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-colors hover:scale-105 transform`}
              >
                {announcement.actions.primary.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  </div>
);

// Template 3: Floating Action Bar
export const FloatingActionBar: React.FC<AnnouncementTemplatesProps> = ({
  announcement,
  onDismiss,
  onAction,
  className = '',
  showAnimation = true,
  compact = false
}) => (
  <div
    className={`fixed bottom-4 right-4 z-50 max-w-sm ${showAnimation ? 'animate-float-in' : ''} ${className}`}
  >
    <div
      className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      style={{
        borderTop: `4px solid ${getTypeColor(announcement.type)}`
      }}
    >
      <div className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 p-2 rounded-full" style={{ backgroundColor: getTypeColor(announcement.type) + '20' }}>
            {getIcon(announcement.type, announcement.styling?.icon, getTypeColor(announcement.type))}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 mb-1`}>{announcement.title}</h4>
            <p className={`text-xs text-gray-600 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
              {announcement.message}
            </p>
            
            {announcement.actions?.primary && (
              announcement.actions.primary.url ? (
                <a
                  href={announcement.actions.primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={announcement.actions.primary.onClick}
                  className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-lg font-medium transition-colors flex items-center space-x-1 inline-flex`}
                >
                  <span>{announcement.actions.primary.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={() => {
                    announcement.actions?.primary?.onClick?.();
                    onAction?.('primary');
                  }}
                  className={`mt-3 bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-lg font-medium transition-colors flex items-center space-x-1`}
                >
                  <span>{announcement.actions.primary.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )
            )}
          </div>
          
          {announcement.dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              aria-label="Dismiss announcement"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {showAnimation && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      )}
    </div>
    
    <style>{`
      @keyframes float-in {
        from { transform: translateY(100px) scale(0.8); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      .animate-float-in { 
        animation: float-in 0.5s ease-out; 
      }
    `}</style>
  </div>
);

// Template 4: Sidebar Panel
export const SidebarPanel: React.FC<AnnouncementTemplatesProps> = ({
  announcement,
  onDismiss,
  onAction,
  className = '',
  showAnimation = true,
  compact = false
}) => {
  const isLeft = announcement.position === 'left';
  
  return (
    <div
      className={`fixed ${isLeft ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 z-40 max-w-xs ${showAnimation ? 'animate-slide-in' : ''} ${className}`}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        style={{
          borderLeft: isLeft ? `4px solid ${getTypeColor(announcement.type)}` : 'none',
          borderRight: !isLeft ? `4px solid ${getTypeColor(announcement.type)}` : 'none'
        }}
      >
        <div className={compact ? "p-3" : "p-6"}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: getTypeColor(announcement.type) + '20' }}>
                {getIcon(announcement.type, announcement.styling?.icon, getTypeColor(announcement.type))}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{announcement.title}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(announcement.type) }}></span>
                  <span className="text-xs text-gray-500">{announcement.type}</span>
                </div>
              </div>
            </div>
            
            {announcement.dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {!compact && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{announcement.message}</p>
          )}
          
          {announcement.actions && (
            <div className="space-y-2">
              {announcement.actions.primary && (
                announcement.actions.primary.url ? (
                  <a
                    href={announcement.actions.primary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={announcement.actions.primary.onClick}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-colors inline-block text-center`}
                  >
                    {announcement.actions.primary.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      announcement.actions?.primary?.onClick?.();
                      onAction?.('primary');
                    }}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} rounded-lg font-medium transition-colors`}
                  >
                    {announcement.actions.primary.label}
                  </button>
                )
              )}
              
              {announcement.actions.secondary && (
                announcement.actions.secondary.url ? (
                  <a
                    href={announcement.actions.secondary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={announcement.actions.secondary.onClick}
                    className={`w-full text-gray-600 hover:text-gray-800 ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors inline-block text-center`}
                  >
                    {announcement.actions.secondary.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      announcement.actions?.secondary?.onClick?.();
                      onAction?.('secondary');
                    }}
                    className={`w-full text-gray-600 hover:text-gray-800 ${compact ? 'text-xs' : 'text-sm'} font-medium transition-colors`}
                  >
                    {announcement.actions.secondary.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(${isLeft ? '-100%' : '100%'}); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { 
          animation: slide-in 0.5s ease-out; 
        }
      `}</style>
    </div>
  );
};

// Template 5: Compact Notification
export const CompactNotification: React.FC<Omit<AnnouncementTemplatesProps, 'compact'>> = ({
  announcement,
  onDismiss,
  onAction,
  className = '',
  showAnimation = true
}) => (
  <div
    className={`group flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${showAnimation ? 'hover:scale-105' : ''} ${className}`}
    style={{
      backgroundColor: announcement.styling?.backgroundColor || 'transparent',
      color: announcement.styling?.textColor || 'inherit'
    }}
  >
    <div className="flex-shrink-0">
      {getIcon(announcement.type, announcement.styling?.icon)}
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold truncate">{announcement.title}</h4>
      <p className="text-xs opacity-90 line-clamp-1">{announcement.message}</p>
    </div>
    
    <div className="flex items-center space-x-1">
      {announcement.actions?.primary && (
        announcement.actions.primary.url ? (
          <a
            href={announcement.actions.primary.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={announcement.actions.primary.onClick}
            className="text-xs font-medium opacity-70 hover:opacity-100 transition-opacity inline-block"
          >
            {announcement.actions.primary.label}
          </a>
        ) : (
          <button
            onClick={() => {
              announcement.actions?.primary?.onClick?.();
              onAction?.('primary');
            }}
            className="text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            {announcement.actions.primary.label}
          </button>
        )
      )}
      
      {announcement.dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="opacity-50 hover:opacity-100 transition-opacity p-1"
          aria-label="Dismiss announcement"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

// Helper functions
const getIcon = (type: string, customIcon?: string, color?: string) => {
  const iconColor = color || '#6b7280';
  const iconClass = "w-5 h-5";
  
  // For now, if customIcon is provided, we still use the Star icon as a fallback
  // In a real implementation, you might want to map custom icon names to actual icons
  if (customIcon) {
    return <Star className={iconClass} style={{ color: iconColor }} fill="currentColor" />;
  }
  
  switch (type) {
    case 'info':
      return <Info className={iconClass} style={{ color: iconColor }} />;
    case 'warning':
      return <AlertTriangle className={iconClass} style={{ color: iconColor }} />;
    case 'success':
      return <CheckCircle className={iconClass} style={{ color: iconColor }} />;
    case 'error':
      return <XCircle className={iconClass} style={{ color: iconColor }} />;
    case 'promotion':
      return <Gift className={iconClass} style={{ color: iconColor }} />;
    default:
      return <Info className={iconClass} style={{ color: iconColor }} />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'info':
      return '#3b82f6';
    case 'warning':
      return '#f59e0b';
    case 'success':
      return '#10b981';
    case 'error':
      return '#ef4444';
    case 'promotion':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

const formatTimeRemaining = (endDate: string) => {
  try {
    const now = new Date();
    const end = new Date(endDate);
    
    // Check for invalid dates
    if (isNaN(end.getTime()) || isNaN(now.getTime())) {
      return 'Invalid date';
    }
    
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  } catch (error) {
    console.error('Error formatting time remaining:', error);
    return 'Error';
  }
};

// Default export
const AnnouncementTemplates = {
  ModernTopBanner,
  CardAnnouncement,
  FloatingActionBar,
  SidebarPanel,
  CompactNotification
};

export default AnnouncementTemplates;