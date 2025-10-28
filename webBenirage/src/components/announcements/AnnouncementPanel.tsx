import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Heart,
  Coffee,
  Users,
  Smartphone,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MousePointer,
  Bell,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Announcement } from '../../types/announcements';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AnnouncementPanelProps {
  announcements: Announcement[];
  onDismiss: (id: string) => void;
  variant?: 'compact' | 'detailed' | 'minimal';
  maxHeight?: string;
  showStats?: boolean;
  className?: string;
}

const AnnouncementPanel: React.FC<AnnouncementPanelProps> = ({
  announcements,
  onDismiss,
  variant = 'detailed',
  maxHeight = 'max-h-96',
  showStats = false,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [autoHideTimers, setAutoHideTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Icon mapping with enhanced icons
  const getIcon = (iconName?: string, type?: Announcement['type']) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      Heart,
      Coffee,
      Users,
      Smartphone,
      AlertTriangle,
      Info,
      CheckCircle,
      AlertCircle,
      Bell,
      Sparkles,
      Zap,
      Star
    };

    // Type-based icon fallback
    const typeIcons = {
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle,
      error: AlertCircle,
      promotion: Sparkles
    };

    return iconMap[iconName || ''] || typeIcons[type || 'info'] || Info;
  };

  // Enhanced type-based styling with gradients and animations
  const getTypeStyles = (type: Announcement['type'], priority: Announcement['priority']) => {
    const baseStyles = {
      info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900 shadow-blue-100',
      warning: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300 text-yellow-900 shadow-yellow-100',
      success: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 text-green-900 shadow-green-100',
      error: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 text-red-900 shadow-red-100',
      promotion: 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 text-purple-900 shadow-purple-100'
    };

    const priorityStyles = {
      low: '',
      medium: 'ring-2 ring-opacity-50',
      high: 'ring-2 ring-opacity-75 animate-pulse',
      urgent: 'ring-2 ring-red-400 ring-opacity-75 animate-bounce'
    };

    return {
      container: `${baseStyles[type]} ${priorityStyles[priority]} transition-all duration-300`,
      icon: getIconBgColor(type),
      badge: getPriorityBadge(priority)
    };
  };

  const getIconBgColor = (type: Announcement['type']) => {
    const colors = {
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
      promotion: 'bg-purple-500'
    };
    return colors[type];
  };

  const getPriorityBadge = (priority: Announcement['priority']) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600 animate-pulse'
    };
    return badges[priority];
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

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (announcements.length === 0) {
    return (
      <Card className={`text-center py-8 ${className}`}>
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No announcements at the moment</p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Announcements</h3>
              <p className="text-blue-100 text-sm">
                {announcements.length} active {announcements.length === 1 ? 'announcement' : 'announcements'}
              </p>
            </div>
          </div>

          {showStats && (
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{announcements.reduce((acc, a) => acc + (a.analytics?.impressions || 0), 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MousePointer className="w-4 h-4" />
                <span>{announcements.reduce((acc, a) => acc + (a.analytics?.clicks || 0), 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${maxHeight} overflow-y-auto`}>
        <div className="p-4 space-y-4">
          {announcements.map((announcement) => {
            const IconComponent = getIcon(announcement.styling?.icon, announcement.type);
            const styles = getTypeStyles(announcement.type, announcement.priority);
            const isExpanded = expandedItems.has(announcement.id);
            const isHovered = hoveredId === announcement.id;

            return (
              <div
                key={announcement.id}
                className={`
                  ${styles.container}
                  border rounded-xl p-4 transition-all duration-300 hover:shadow-lg
                  ${isHovered ? 'scale-[1.02] shadow-xl' : ''}
                  ${announcement.dismissible ? 'pr-12' : ''}
                  ${variant === 'compact' ? 'p-3' : ''}
                `}
                style={{
                  background: announcement.styling?.backgroundColor || undefined,
                  color: announcement.styling?.textColor || undefined,
                  borderColor: announcement.styling?.borderColor || undefined
                }}
                onMouseEnter={() => setHoveredId(announcement.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Priority indicator */}
                {announcement.priority === 'urgent' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                )}

                {/* Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${styles.icon} text-white flex-shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-bold truncate ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
                        {announcement.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                        {announcement.priority}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        announcement.type === 'info' ? 'bg-blue-100 text-blue-700' :
                        announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        announcement.type === 'success' ? 'bg-green-100 text-green-700' :
                        announcement.type === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {announcement.type}
                      </span>

                      {announcement.autoHide && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Auto-hide</span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <p className={`leading-relaxed ${variant === 'compact' ? 'text-sm' : 'text-sm'} opacity-90`}>
                      {variant === 'compact' || isExpanded || announcement.message.length < 100
                        ? announcement.message
                        : `${announcement.message.substring(0, 100)}...`
                      }
                    </p>

                    {/* Expand button for long messages */}
                    {announcement.message.length > 100 && variant !== 'compact' && (
                      <button
                        onClick={() => toggleExpanded(announcement.id)}
                        className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Show less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Show more</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {announcement.actions && (announcement.actions.primary || announcement.actions.secondary) && (
                  <div className={`flex space-x-2 mb-3 ${variant === 'compact' ? 'mb-2' : ''}`}>
                    {announcement.actions.primary && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        onClick={announcement.actions.primary.onClick}
                      >
                        {announcement.actions.primary.label}
                      </Button>
                    )}
                    {announcement.actions.secondary && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={announcement.actions.secondary.onClick}
                      >
                        {announcement.actions.secondary.label}
                      </Button>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {variant === 'detailed' && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <span>Posted {formatDate(announcement.startDate)}</span>
                      {announcement.endDate && (
                        <span>Until {formatDate(announcement.endDate)}</span>
                      )}
                    </div>

                    {/* Analytics */}
                    {showStats && announcement.analytics && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{announcement.analytics.impressions}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MousePointer className="w-3 h-3" />
                          <span>{announcement.analytics.clicks}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-hide progress bar */}
                {announcement.autoHide && announcement.autoHideDelay && (
                  <div className="mt-3 bg-black/10 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ease-linear ${
                        announcement.type === 'info' ? 'bg-blue-500' :
                        announcement.type === 'warning' ? 'bg-yellow-500' :
                        announcement.type === 'success' ? 'bg-green-500' :
                        announcement.type === 'error' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}
                      style={{
                        width: '100%',
                        animation: `autoHideProgress ${announcement.autoHideDelay}s linear forwards`
                      }}
                    />
                  </div>
                )}

                {/* Dismiss button */}
                {announcement.dismissible && (
                  <button
                    onClick={() => onDismiss(announcement.id)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-black/10 rounded-full transition-all duration-200 opacity-60 hover:opacity-100"
                    aria-label="Dismiss announcement"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with summary */}
      {variant === 'detailed' && announcements.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              {announcements.some(a => a.priority === 'urgent') && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">{announcements.filter(a => a.priority === 'urgent').length} urgent</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </Card>
  );
};

export default AnnouncementPanel;