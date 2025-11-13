import React from 'react';
import { 
  BarChart3, FileText, Users, MessageSquare, Calendar, 
  TrendingUp, Activity, Eye, Heart, Star, Sparkles,
  ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import Button from '../ui/Button';

interface FigmaDashboardProps {
  onNavigate: (page: string) => void;
}

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const FigmaDashboard: React.FC<FigmaDashboardProps> = ({ onNavigate }) => {
  const stats: StatCard[] = [
    {
      title: 'Total Content',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: '1,293',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Monthly Visitors',
      value: '45.2K',
      change: '+23.1%',
      trend: 'up',
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Engagement Rate',
      value: '68.4%',
      change: '-2.4%',
      trend: 'down',
      icon: Heart,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const quickActions = [
    {
      title: 'Create Content',
      description: 'Start writing a new article or story',
      icon: Plus,
      color: 'from-indigo-500 to-purple-600',
      onClick: () => onNavigate('content-editor')
    },
    {
      title: 'Manage Users',
      description: 'Review applications and users',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      onClick: () => onNavigate('users')
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      onClick: () => onNavigate('analytics')
    }
  ];

  const recentActivity = [
    {
      action: 'New article published',
      user: 'Admin User',
      time: '2 hours ago',
      type: 'content',
      icon: FileText
    },
    {
      action: 'User registration',
      user: 'John Doe',
      time: '4 hours ago',
      type: 'user',
      icon: Users
    },
    {
      action: 'Comment moderation',
      user: 'Editor',
      time: '6 hours ago',
      type: 'comment',
      icon: MessageSquare
    },
    {
      action: 'Newsletter sent',
      user: 'System',
      time: '1 day ago',
      type: 'system',
      icon: Activity
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="figma-heading figma-heading-xl text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Here's what's happening with your content today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => onNavigate('calendar')}
            className="figma-btn-secondary"
            icon={Calendar}
          >
            Content Calendar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="figma-card p-6 group cursor-pointer" onClick={() => onNavigate('analytics')}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : stat.trend === 'down' ? (
                  <ArrowDownRight className="w-4 h-4" />
                ) : null}
                <span className="font-medium">{stat.change}</span>
              </div>
            </div>
            <div>
              <h3 className="figma-heading text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="figma-heading figma-heading-lg text-gray-900">Quick Actions</h2>
          <Sparkles className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="figma-card p-6 cursor-pointer group"
              onClick={action.onClick}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="figma-heading figma-heading-sm text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="figma-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="figma-heading figma-heading-md text-gray-900">Recent Activity</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Performance */}
        <div className="figma-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="figma-heading figma-heading-md text-gray-900">Top Content</h2>
            <Star className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { title: 'Rwanda Cultural Heritage', views: '12.4K', engagement: '89%' },
              { title: 'Community Stories Series', views: '8.7K', engagement: '76%' },
              { title: 'Traditional Crafts Guide', views: '6.2K', engagement: '68%' },
              { title: 'Modern Agriculture Techniques', views: '4.8K', engagement: '72%' }
            ].map((content, index) => (
              <div key={index} className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate('content-list')}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {content.title}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-gray-900">{content.views}</p>
                    <p className="text-xs text-green-600">{content.engagement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="figma-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="figma-heading figma-heading-md text-gray-900">System Status</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">All systems operational</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-1">Database</h3>
            <p className="text-sm text-green-700">Optimal performance</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-1">API</h3>
            <p className="text-sm text-blue-700">99.9% uptime</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-1">Storage</h3>
            <p className="text-sm text-purple-700">2.1GB available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaDashboard;