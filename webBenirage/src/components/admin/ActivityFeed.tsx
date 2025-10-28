import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, MessageSquare, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Eye, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ActivityMetadata {
  user_id?: string;
  email?: string;
  phone?: string;
  amount?: number;
  category?: string;
  subject?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | undefined;
}

interface ActivityItem {
  id: string;
  type: 'membership' | 'volunteer' | 'contact' | 'partnership' | 'donation' | 'content';
  title: string;
  subtitle: string;
  time: string;
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  amount?: number;
  user_id?: string;
  metadata?: ActivityMetadata;
}

interface ActivityFeedProps {
  onRefresh?: () => void;
  className?: string;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
  schema: string;
  table: string;
  commit_timestamp: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ onRefresh, className = '' }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load recent activities from all relevant tables
      const [
        memberships,
        volunteers,
        contacts,
        donations
      ] = await Promise.all([
        supabase
          .from('membership_applications')
          .select('*')
          .order('submission_date', { ascending: false })
          .limit(5),
        supabase
          .from('volunteer_applications')
          .select('*')
          .order('submission_date', { ascending: false })
          .limit(5),
        supabase
          .from('contact_submissions')
          .select('*')
          .order('submission_date', { ascending: false })
          .limit(5),
        supabase
          .from('donations')
          .select('*')
          .order('donation_date', { ascending: false })
          .limit(5)
      ]);

      // Combine and format activities
      const allActivities: ActivityItem[] = [
        ...(memberships.data || []).map(item => ({
          id: `membership-${item.id}`,
          type: 'membership' as const,
          title: `${item.first_name} ${item.last_name}`,
          subtitle: 'New membership application',
          time: formatTimeAgo(new Date(item.submission_date)),
          status: item.status,
          user_id: item.id
        })),
        ...(volunteers.data || []).map(item => ({
          id: `volunteer-${item.id}`,
          type: 'volunteer' as const,
          title: `${item.first_name} ${item.last_name}`,
          subtitle: 'New volunteer application',
          time: formatTimeAgo(new Date(item.submission_date)),
          status: item.status,
          user_id: item.id
        })),
        ...(contacts.data || []).map(item => ({
          id: `contact-${item.id}`,
          type: 'contact' as const,
          title: `${item.first_name} ${item.last_name}`,
          subtitle: item.subject || 'Contact form submission',
          time: formatTimeAgo(new Date(item.submission_date)),
          status: item.status,
          user_id: item.id
        })),
        ...(donations.data || []).map(item => ({
          id: `donation-${item.id}`,
          type: 'donation' as const,
          title: `Donation received`,
          subtitle: `$${item.amount?.toLocaleString() || 0} donation`,
          time: formatTimeAgo(new Date(item.donation_date)),
          status: 'completed' as const,
          amount: item.amount,
          user_id: item.id
        }))
      ];

      // Sort by time and take the most recent 10
      allActivities.sort((a, b) => {
        const timeA = a.time.includes('ago') ? Date.now() - parseTimeAgo(a.time) : new Date(a.time).getTime();
        const timeB = b.time.includes('ago') ? Date.now() - parseTimeAgo(b.time) : new Date(b.time).getTime();
        return timeB - timeA;
      });

      setActivities(allActivities.slice(0, 10));

    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRealtimeUpdate = useCallback((payload: RealtimePayload) => {
    console.log('Real-time activity update received:', payload);
    // Refresh activities when new data comes in
    loadActivities();
  }, [loadActivities]);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const parseTimeAgo = (timeAgo: string): number => {
    const match = timeAgo.match(/(\d+)([mhd])/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'membership': return Users;
      case 'volunteer': return TrendingUp;
      case 'contact': return MessageSquare;
      case 'donation': return DollarSign;
      case 'partnership': return FileText;
      default: return FileText;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'membership': return 'text-blue-600 bg-blue-100';
      case 'volunteer': return 'text-green-600 bg-green-100';
      case 'contact': return 'text-purple-600 bg-purple-100';
      case 'donation': return 'text-yellow-600 bg-yellow-100';
      case 'partnership': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    loadActivities();

    // Add system update notification for the new goal progress feature
    const systemUpdateActivity: ActivityItem = {
      id: 'system-update-goals',
      type: 'content',
      title: 'Goal Progress Enhanced',
      subtitle: 'Direct progress updates now available - click on current values to update',
      time: 'Just now',
      status: 'completed'
    };

    setActivities(prev => [systemUpdateActivity, ...prev.slice(0, 9)]);

    // Set up real-time subscription for new activities
    const subscription = supabase
      .channel('recent-activities')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'membership_applications'
        },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteer_applications'
        },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_submissions'
        },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [handleRealtimeUpdate, loadActivities]);

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadActivities}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-500">Real-time updates from your platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
          <button
            onClick={() => {
              loadActivities();
              onRefresh?.();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColorClass = getActivityColor(activity.type);

              return (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {getStatusIcon(activity.status)}
                          <span className="text-xs text-gray-400">
                            {activity.time}
                          </span>
                        </div>
                      </div>

                      {/* Metadata */}
                      {activity.amount && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-sm font-semibold text-green-600">
                            ${activity.amount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Activity will appear here as users interact with your website
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center space-x-1">
            <span>View All Activity</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;