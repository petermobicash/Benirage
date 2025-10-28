/**
 * React Hooks for Notification Management
 * Provides reactive notification checking and management for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  recipient_id: string;
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

export interface UseNotificationsOptions {
  checkOnMount?: boolean;
  userId?: string;
  type?: string;
  unreadOnly?: boolean;
}

export interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  author_id: string;
  assigned_to?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  is_enabled: boolean;
  channels: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Hook for managing user notifications
 */
export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsResult => {
  const { checkOnMount = true, userId, type, unreadOnly = false } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(checkOnMount);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) {
        setNotifications([]);
        return;
      }

      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setNotifications([]);
        return;
      }

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', targetUserId);

      if (type) {
        query = query.eq('type', type);
      }

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setNotifications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('Notification loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type, unreadOnly]);

  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true }
            : n
        )
      );

      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) return false;

      const targetUserId = userId || user?.id;
      if (!targetUserId) return false;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('recipient_id', targetUserId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (checkOnMount) {
      loadNotifications();
    }
  }, [loadNotifications, checkOnMount]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh
  };
};

/**
 * Hook for workflow task notifications
 */
export const useWorkflowNotifications = (userId?: string) => {
  return useNotifications({
    userId,
    type: 'workflow_task',
    unreadOnly: true
  });
};

/**
 * Hook for pending tasks (content ready for publishing)
 */
export const usePendingTasks = (userId?: string) => {
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) {
        setPendingTasks([]);
        return;
      }

      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setPendingTasks([]);
        return;
      }

      let query = supabase
        .from('workflow_dashboard')
        .select('*')
        .eq('status', 'reviewed');

      // Filter by user if userId is provided or if we have a current user
      // Show items where user is either the author or assigned to them
      if (targetUserId) {
        query = query.or(`author_id.eq.${targetUserId},assigned_to.eq.${targetUserId}`);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPendingTasks(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pending tasks';
      setError(errorMessage);
      console.error('Pending tasks loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPendingTasks();
  }, [loadPendingTasks]);

  return {
    pendingTasks,
    isLoading,
    error,
    refresh: loadPendingTasks
  };
};

/**
 * Hook for notification preferences
 */
export const useNotificationPreferences = (userId?: string) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) {
        setPreferences([]);
        return;
      }

      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setPreferences([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', targetUserId);

      if (fetchError) throw fetchError;

      setPreferences(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notification preferences';
      setError(errorMessage);
      console.error('Notification preferences loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updatePreference = useCallback(async (
    type: string,
    isEnabled: boolean,
    channels: string[] = ['in_app', 'email']
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) return false;

      const targetUserId = userId || user?.id;
      if (!targetUserId) return false;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: targetUserId,
          notification_type: type,
          is_enabled: isEnabled,
          channels: channels,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Reload preferences
      await loadPreferences();
      return true;
    } catch (err) {
      console.error('Error updating notification preference:', err);
      return false;
    }
  }, [userId, loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    refresh: loadPreferences
  };
};