import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, MessageSquare, Heart, AtSign, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppNotification } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface NotificationCenterProps {
  userId?: string;
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mentions' | 'comments'>('all');

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const setupRealTimeSubscription = useCallback(() => {
    if (!userId) return;

    const channel = supabase.channel(`notifications-${userId}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as AppNotification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      setupRealTimeSubscription();
    }
  }, [userId, loadNotifications, setupRealTimeSubscription]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'reply': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'mention': return <AtSign className="w-4 h-4 text-purple-500" />;
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'system': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: AppNotification['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.is_read;
      case 'mentions': return notification.type === 'mention';
      case 'comments': return ['comment', 'reply'].includes(notification.type);
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-dark-blue">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-1 p-2 border-b border-gray-200">
        {[
          { id: 'all', name: 'All', count: notifications.length },
          { id: 'unread', name: 'Unread', count: unreadCount },
          { id: 'mentions', name: 'Mentions', count: notifications.filter(n => n.type === 'mention').length },
          { id: 'comments', name: 'Comments', count: notifications.filter(n => ['comment', 'reply'].includes(n.type)).length }
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as typeof filter)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === filterOption.id
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            {filterOption.name} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-3 rounded-lg cursor-pointer transition-colors ${
                  getPriorityColor(notification.priority)
                } ${!notification.is_read ? 'font-medium' : ''}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'unread' ? 'No unread notifications' :
               filter === 'mentions' ? 'No mentions' :
               filter === 'comments' ? 'No comment notifications' :
               'No notifications'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NotificationCenter;