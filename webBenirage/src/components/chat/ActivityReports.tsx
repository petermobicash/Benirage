import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Download, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ActivityLog } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ActivityReportsProps {
  dateRange?: string;
}

interface ActivityData {
  totalActivities: number;
  totalComments: number;
  totalMessages: number;
  uniqueUsers: number;
  activityByType: Record<string, number>;
  activityByDay: Record<string, number>;
  topUsers: [string, number][];
  recentActivities: ActivityLog[];
  commentEngagement: {
    totalComments: number;
    averageLength: number;
    topCommenters: [string, number][];
  };
}

const ActivityReports: React.FC<ActivityReportsProps> = ({ dateRange = '7d' }) => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);
  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'user' | 'content'>('overview');

  const loadActivityData = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedDateRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Load activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      // Load comments data
      const { data: comments } = await supabase
        .from('content_comments')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Load chat messages data
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Process data for reports
      const processedData = {
        totalActivities: activities?.length || 0,
        totalComments: comments?.length || 0,
        totalMessages: messages?.length || 0,
        uniqueUsers: new Set([
          ...(activities?.map(a => a.user_id).filter(Boolean) || []),
          ...(comments?.map(c => c.author_id).filter(Boolean) || []),
          ...(messages?.map(m => m.sender_id).filter(Boolean) || [])
        ]).size,
        
        // Activity by type
        activityByType: activities?.reduce((acc: Record<string, number>, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        }, {}) || {},

        // Activity by day
        activityByDay: activities?.reduce((acc: Record<string, number>, activity) => {
          const day = activity.timestamp.split('T')[0];
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {}) || {},

        // Top users by activity
        topUsers: Object.entries(
          activities?.reduce((acc: Record<string, number>, activity) => {
            if (activity.user_name) {
              acc[activity.user_name] = (acc[activity.user_name] || 0) + 1;
            }
            return acc;
          }, {}) || {}
        )
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10) as [string, number][],
        
        // Recent activities
        recentActivities: activities?.slice(0, 20) || [],
        
        // Comment engagement
        commentEngagement: {
          totalComments: comments?.length || 0,
          averageLength: comments?.length ? 
            Math.round(comments.reduce((sum, c) => sum + c.comment_text.length, 0) / comments.length) : 0,
          topCommenters: Object.entries(
            comments?.reduce((acc: Record<string, number>, comment) => {
              acc[comment.author_name] = (acc[comment.author_name] || 0) + 1;
              return acc;
            }, {}) || {}
          )
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5) as [string, number][]
        }
      };

      setActivityData(processedData);

    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange]);

  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);

  const exportReport = async () => {
    try {
      const reportData = {
        generated_at: new Date().toISOString(),
        date_range: selectedDateRange,
        report_type: reportType,
        data: activityData
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `benirage_activity_report_${selectedDateRange}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const exportCSV = async (type: 'activities' | 'comments') => {
    try {
      const table = type === 'activities' ? 'activity_logs' : 'content_comments';
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;

      // Convert data to CSV format
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `benirage_${type}_${selectedDateRange}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Activity Reports</h2>
          <p className="text-gray-600">Comprehensive communication and engagement analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={exportReport} icon={Download}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{activityData?.totalActivities || 0}</div>
          <div className="text-gray-600">Total Activities</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{activityData?.totalComments || 0}</div>
          <div className="text-gray-600">Comments Posted</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{activityData?.totalMessages || 0}</div>
          <div className="text-gray-600">Chat Messages</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{activityData?.uniqueUsers || 0}</div>
          <div className="text-gray-600">Active Users</div>
        </Card>
      </div>

      {/* Report Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart3 },
          { id: 'detailed', name: 'Detailed', icon: MessageSquare },
          { id: 'user', name: 'User Activity', icon: Users },
          { id: 'content', name: 'Content Engagement', icon: TrendingUp }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as typeof reportType)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
              reportType === tab.id
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Activity by Type</h3>
            <div className="space-y-3">
              {Object.entries(activityData?.activityByType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-semibold text-blue-600">{count as number}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Top Active Users</h3>
            <div className="space-y-3">
              {activityData?.topUsers?.map(([userName, count]: [string, number], index: number) => (
                <div key={userName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-gray-700">{userName}</span>
                  </div>
                  <span className="font-semibold text-blue-600">{count} activities</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {reportType === 'detailed' && (
        <Card>
          <h3 className="font-semibold text-blue-900 mb-4">Recent Activity Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityData?.recentActivities?.map((log: ActivityLog) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.user_name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resource_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {reportType === 'content' && (
        <Card>
          <h3 className="font-semibold text-blue-900 mb-4">Comment Engagement Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Total Comments</h4>
              <div className="text-2xl font-bold text-blue-600">
                {activityData?.commentEngagement?.totalComments || 0}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Average Length</h4>
              <div className="text-2xl font-bold text-green-600">
                {activityData?.commentEngagement?.averageLength || 0} chars
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Top Commenters</h4>
              <div className="space-y-1">
                {activityData?.commentEngagement?.topCommenters?.slice(0, 3).map(([name, count]: [string, number]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-purple-700">{name}</span>
                    <span className="font-medium text-purple-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={exportReport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export JSON Report
          </Button>
          <Button variant="outline" onClick={() => exportCSV('activities')} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Activity CSV
          </Button>
          <Button variant="outline" onClick={() => exportCSV('comments')} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Comments CSV
          </Button>
        </div>
      </Card>
    </div>
  );

};

export default ActivityReports;