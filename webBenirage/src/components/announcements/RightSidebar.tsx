import { useState } from 'react';
import { X, TrendingUp, Users, Activity, DollarSign, Calendar, Lightbulb, Star, Zap, Target } from 'lucide-react';
import MonthlyGoalProgress from '../admin/MonthlyGoalProgress';

interface RightSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const RightSidebar = ({
  isCollapsed = false,
  onToggleCollapse
}: RightSidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'menu' | 'goals'>('menu');

  // Sample data for the right panel - this can be customized based on needs
  const quickStats = [
    { id: 'visitors', label: 'Live Visitors', value: '247', icon: Users, color: 'text-blue-600' },
    { id: 'engagement', label: 'Engagement', value: '89%', icon: TrendingUp, color: 'text-green-600' },
    { id: 'activity', label: 'Active Now', value: '12', icon: Activity, color: 'text-purple-600' },
  ];

  const quickActions = [
    { id: 'donate', label: 'Quick Donate', icon: DollarSign, color: 'text-green-600' },
    { id: 'events', label: 'Upcoming Events', icon: Calendar, color: 'text-blue-600' },
    { id: 'tips', label: 'Daily Tips', icon: Lightbulb, color: 'text-yellow-600' },
  ];

  const featuredContent = [
    { id: 'story1', title: 'Community Impact Story', type: 'Story', icon: Star },
    { id: 'update1', title: 'Program Updates', type: 'News', icon: Zap },
    { id: 'goal1', title: 'Monthly Goal Progress', type: 'Goal', icon: Target, badge: 'Updated' },
  ];

  return (
    <div className={`
      h-full transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-12' : 'w-full'}
    `}>
      <div className="bg-white/95 backdrop-blur-sm rounded-l-lg shadow-lg border border-gray-200/50 h-96 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-purple-600 to-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-semibold text-sm">
                {activeView === 'goals' ? 'Goal Progress' : 'Quick Access'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {activeView === 'goals' && !isCollapsed && (
              <button
                onClick={() => setActiveView('menu')}
                className="p-1 hover:bg-white/20 rounded transition-colors duration-200 text-xs"
                aria-label="Back to menu"
              >
                ← Back
              </button>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <X className="w-4 h-4 rotate-45" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-4 max-h-80 overflow-y-auto">
          {activeView === 'goals' ? (
            <MonthlyGoalProgress
              isCompact={true}
              onGoalClick={(goal) => {
                console.log('Goal clicked:', goal);
                // Could open a detailed view or modal here
              }}
            />
          ) : (
            <>
          {/* Quick Stats */}
          {!isCollapsed && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live Stats</h4>
              <div className="grid grid-cols-1 gap-2">
                {quickStats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <div
                      key={stat.id}
                      className={`
                        flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200
                        ${hoveredItem === stat.id ? 'bg-blue-50' : ''}
                      `}
                      onMouseEnter={() => setHoveredItem(stat.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <IconComponent className={`w-4 h-4 ${stat.color}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.id}
                      className={`
                        flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 w-full text-left
                        ${hoveredItem === action.id ? 'bg-purple-50' : ''}
                      `}
                      onMouseEnter={() => setHoveredItem(action.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <IconComponent className={`w-4 h-4 ${action.color}`} />
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Content & Ads */}
          {!isCollapsed && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Featured</h4>
              <div className="space-y-2">
                {featuredContent.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`
                        flex items-center space-x-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer
                        ${hoveredItem === item.id ? 'bg-yellow-50' : ''}
                      `}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={() => {
                        if (item.id === 'goal1') {
                          setActiveView('goals');
                        }
                      }}
                    >
                      <IconComponent className="w-4 h-4 text-orange-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{item.type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Featured Ad Placement */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">💎</span>
                  </div>
                  <div className="text-xs font-semibold text-blue-800">Premium Ad</div>
                </div>
                <div className="text-xs text-blue-600 mb-2">Featured Placement</div>
                <div className="bg-white rounded border border-blue-200 p-2 text-xs text-gray-600">
                  Sponsored Content Area
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-gray-100">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs text-gray-500">
                  Panel v1.1
                </span>
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Updated
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Enhanced goal progress tracking
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;