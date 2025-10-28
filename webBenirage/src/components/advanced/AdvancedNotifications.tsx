import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Archive, Trash2, Filter, Search, Star, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AppNotification } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AdvancedNotificationsProps {
  userId: string;
  onNotificationClick?: (notification: AppNotification) => void;
}

const AdvancedNotifications: React.FC<AdvancedNotificationsProps> = ({
  userId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const setupRealTimeSubscription = useCallback(() => {
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

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/LOGO_CLEAR_stars.png',
              badge: '/LOGO_CLEAR_stars.png'
            });
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setNotifications]);

  useEffect(() => {
    loadNotifications();
    const cleanup = setupRealTimeSubscription();

    return () => {
      if (cleanup) cleanup();
    };
  }, [userId, loadNotifications, setupRealTimeSubscription]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const archiveNotifications = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true })
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, is_archived: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error archiving notifications:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('BENIRAGE Notifications Enabled', {
          body: 'You will now receive real-time notifications',
          icon: '/LOGO_CLEAR_stars.png'
        });
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    switch (filter) {
      case 'unread':
        if (notification.is_read) return false;
        break;
      case 'important':
        if (notification.priority !== 'high' && notification.priority !== 'urgent') return false;
        break;
      case 'archived':
        if (!notification.is_archived) return false;
        break;
      default:
        if (notification.is_archived) return false;
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read && !n.is_archived).length;
  const selectedArray = Array.from(selectedIds);

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'mention': return '@';
      case 'like': return '❤️';
      case 'chat': return '💬';
      case 'system': return '⚙️';
      case 'admin': return '🛡️';
      default: return '🔔';
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

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center space-x-3">
          {Notification.permission !== 'granted' && (
            <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
              Enable Browser Notifications
            </Button>
          )}
          
          {selectedArray.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => markAsRead(selectedArray)}>
                <Check className="w-4 h-4 mr-1" />
                Mark Read
              </Button>
              <Button size="sm" variant="outline" onClick={() => archiveNotifications(selectedArray)}>
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteNotifications(selectedArray)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'important' | 'archived')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="important">Important</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
                getPriorityColor(notification.priority)
              } ${!notification.is_read ? 'font-medium' : ''} ${
                selectedIds.has(notification.id) ? 'ring-2 ring-blue-500' : 'cursor-pointer hover:bg-opacity-80'
              }`}
              title={selectedIds.has(notification.id) ? "Selected - Click to deselect" : "Click to view • Ctrl+Click to select"}
              onClick={(e) => {
                // If Ctrl/Cmd is held, toggle selection
                if (e.ctrlKey || e.metaKey) {
                  if (selectedIds.has(notification.id)) {
                    setSelectedIds(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(notification.id);
                      return newSet;
                    });
                  } else {
                    setSelectedIds(prev => new Set([...prev, notification.id]));
                  }
                } else {
                  // Otherwise, trigger individual notification click
                  if (onNotificationClick) {
                    onNotificationClick(notification);
                  }
                  // Mark as read if not already read
                  if (!notification.is_read) {
                    markAsRead([notification.id]);
                  }
                }
              }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(notification.id)}
                    onChange={(e) => {
                      e.stopPropagation(); // Prevent triggering parent onClick
                      if (selectedIds.has(notification.id)) {
                        setSelectedIds(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(notification.id);
                          return newSet;
                        });
                      } else {
                        setSelectedIds(prev => new Set([...prev, notification.id]));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex-shrink-0 text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-blue-900 truncate">
                      {notification.title}
                    </h4>
                    {notification.priority === 'urgent' && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {notification.priority === 'high' && (
                      <Star className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'admin' ? 'bg-red-100 text-red-600' :
                        notification.type === 'system' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === 'unread' ? 'No unread notifications' :
               filter === 'important' ? 'No important notifications' :
               filter === 'archived' ? 'No archived notifications' :
               searchTerm ? 'No matching notifications' :
               'No notifications'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Notifications will appear here when you receive them'}
            </p>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card>
          <h3 className="font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAsRead(notifications.filter(n => !n.is_read).map(n => n.id))}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => archiveNotifications(notifications.filter(n => n.is_read && !n.is_archived).map(n => n.id))}
            >
              Archive Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteNotifications(notifications.filter(n => n.is_archived).map(n => n.id))}
            >
              Delete Archived
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
            >
              Refresh
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedNotifications;