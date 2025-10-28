/**
 * Enhanced Notification Center for Publishers
 * Shows pending workflow tasks and notifications
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Check, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { usePermission } from '../../hooks/usePermissions';
import { CONTENT_PERMISSIONS } from '../../types/permissions';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  data?: Record<string, unknown>;
}

interface PendingTask {
  id: string;
  content_id: string;
  title: string;
  type: string;
  status: string;
  workflow_stage: string;
  author: string;
  updated_at: string;
  priority: string;
  due_date?: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'tasks'>('tasks');

  // Check if user can publish content
  const { hasPermission: canPublish } = usePermission(CONTENT_PERMISSIONS.CONTENT_PUBLISH);

  useEffect(() => {
    if (canPublish) {
      loadNotifications();
      loadPendingTasks();
    }
  }, [canPublish]);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPendingTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_dashboard')
        .select('*')
        .eq('status', 'reviewed')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPendingTasks(data || []);
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'normal': return <Info className="w-4 h-4 text-blue-500" />;
      case 'low': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'draft': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!canPublish) {
    return (
      <Card className="text-center p-8">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You need publishing permissions to view notifications and pending tasks.
        </p>
        <Button
          onClick={async () => {
            try {
              // Import and call the fix function
              const { fixPublishingPermissions } = await import('../../utils/fixPublishingPermissions');
              const result = await fixPublishingPermissions();

              if (result.success) {
                alert('✅ ' + result.message);
                // Refresh the page to update permissions
                window.location.reload();
              } else {
                alert('❌ ' + result.message + (result.error ? ': ' + result.error : ''));
              }
            } catch (error) {
              alert('❌ Error fixing permissions: ' + (error instanceof Error ? error.message : String(error)));
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Fix Publishing Permissions
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Notification Center</h2>
          <p className="text-gray-600">Stay updated on pending tasks and notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-500">
            {notifications.length + pendingTasks.length} items
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-gray-600 hover:text-blue-900'
          }`}
        >
          Pending Tasks ({pendingTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 px-4 py-3 rounded-md font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-gray-600 hover:text-blue-900'
          }`}
        >
          Notifications ({notifications.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => (
              <Card key={task.id} className={`p-4 border-l-4 ${getPriorityColor(task.priority)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getTaskStatusIcon(task.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600">Type: {task.type} • Author: {task.author}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          task.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                          task.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm">
                      {task.status === 'reviewed' ? 'Publish' : 'Review'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Tasks</h3>
              <p className="text-gray-500">
                All content has been processed. Check back later for new tasks.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            <>
              {/* Mark all as read button */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
                <Button size="sm" variant="outline" onClick={markAllNotificationsAsRead}>
                  Mark All Read
                </Button>
              </div>

              {notifications.map((notification) => (
                <Card key={notification.id} className={`p-4 border-l-4 ${getPriorityColor(notification.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getPriorityIcon(notification.priority)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.action_url && (
                        <Button size="sm" variant="outline">
                          {notification.action_label || 'View'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <Card className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No New Notifications</h3>
              <p className="text-gray-500">
                You're all caught up! New notifications will appear here.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;