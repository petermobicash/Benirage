import { useState } from 'react';
import { X, Heart, Coffee, Users, Smartphone, AlertTriangle, Info, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Announcement } from '../../types/announcements';

interface LeftSidebarProps {
  announcements: Announcement[];
  onDismiss: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const LeftSidebar = ({
  announcements,
  onDismiss,
  isCollapsed = false,
  onToggleCollapse
}: LeftSidebarProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  // Type-based styling
  const getTypeStyles = (type: Announcement['type']) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      promotion: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return styles[type] || styles.info;
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`
        h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-12' : 'w-full'}
      `}>
        <div className="bg-white/95 backdrop-blur-sm rounded-r-lg shadow-lg border border-gray-200/50 h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              {!isCollapsed && <span className="font-semibold text-sm">Announcements</span>}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
            {announcements.map((announcement) => {
              const IconComponent = getIcon(announcement.styling?.icon);
              const typeStyles = getTypeStyles(announcement.type);

              return (
                <div
                  key={announcement.id}
                  className={`
                    ${typeStyles}
                    border rounded-lg p-3 transition-all duration-200 hover:shadow-md
                    ${hoveredId === announcement.id ? 'scale-105 shadow-lg' : ''}
                    ${announcement.dismissible ? 'pr-10' : ''}
                  `}
                  style={{
                    backgroundColor: announcement.styling?.backgroundColor,
                    color: announcement.styling?.textColor,
                    borderColor: announcement.styling?.borderColor
                  }}
                  onMouseEnter={() => setHoveredId(announcement.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Header with icon and title */}
                  <div className="flex items-start space-x-2 mb-2">
                    <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {announcement.title && !isCollapsed && (
                      <h4 className="font-semibold text-sm leading-tight">
                        {announcement.title}
                      </h4>
                    )}
                  </div>

                  {/* Message */}
                  {!isCollapsed && (
                    <p className="text-xs leading-relaxed mb-3 opacity-90">
                      {announcement.message}
                    </p>
                  )}

                  {/* Actions */}
                  {!isCollapsed && (announcement.actions?.primary || announcement.actions?.secondary) && (
                    <div className="flex space-x-2 mb-2">
                      {announcement.actions?.primary && (
                        <a
                          href={announcement.actions.primary.url}
                          onClick={announcement.actions.primary.onClick}
                          className="flex-1 bg-white/80 hover:bg-white text-gray-800 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 text-center"
                        >
                          {announcement.actions.primary.label}
                        </a>
                      )}
                      {announcement.actions?.secondary && (
                        <a
                          href={announcement.actions.secondary.url}
                          onClick={announcement.actions.secondary.onClick}
                          className="flex-1 bg-white/40 hover:bg-white/60 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 text-center"
                        >
                          {announcement.actions.secondary.label}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Dismiss button */}
                  {announcement.dismissible && (
                    <button
                      onClick={() => onDismiss(announcement.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full transition-colors duration-200 opacity-60 hover:opacity-100"
                      aria-label="Dismiss announcement"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  {/* Priority indicator */}
                  {announcement.priority === 'urgent' && (
                    <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {!isCollapsed && announcements.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-500">
                {announcements.length} active announcement{announcements.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-full'}`}></div>
    </>
  );
};

export default LeftSidebar;