import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface QueuedMessage {
  id: string;
  roomId: string;
  message: string;
  timestamp: number;
  retryCount: number;
}

interface OfflineChatState {
  isOnline: boolean;
  queuedMessages: QueuedMessage[];
  sendingQueue: boolean;
}

// Utility function to send message directly without hooks
const sendMessageDirectly = async (roomId: string, messageText: string): Promise<void> => {
  if (!roomId || !messageText.trim()) {
    throw new Error('Room ID and message text are required');
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Handle authentication errors gracefully
    if (userError) {
      if (userError.message?.includes('Invalid Refresh Token') ||
          userError.message?.includes('Refresh Token Not Found') ||
          userError.message?.includes('Auth session missing') ||
          userError.status === 403) {
        console.warn('Authentication failed for sending message:', userError.message);
        throw new Error('Please log in to send messages');
      }
      throw new Error(`Authentication error: ${userError.message}`);
    }

    if (!user) {
      console.warn('No authenticated user found for sending message');
      throw new Error('Please log in to send messages');
    }

    // Get user profile for name and avatar
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    const messageData = {
      room_id: roomId,
      sender_id: user.id,
      sender_name: profile?.display_name || user.email?.split('@')[0] || 'Anonymous',
      sender_avatar: profile?.avatar_url,
      message_text: messageText,
      message_type: 'text' as const,
      attachments: [],
      mentions: [],
      message_status: 'sent' as const
    };

    const { error } = await supabase
      .from('chat_messages')
      .insert([messageData]);

    if (error) throw error;

    // Update room last activity
    await supabase
      .from('chat_rooms')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', roomId);

  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};

export const useOfflineChat = (roomId?: string) => {
  const [state, setState] = useState<OfflineChatState>({
    isOnline: navigator.onLine,
    queuedMessages: [],
    sendingQueue: false
  });

  // Load queued messages from localStorage on mount
  useEffect(() => {
    if (roomId) {
      const saved = localStorage.getItem(`chat_queue_${roomId}`);
      if (saved) {
        try {
          const queuedMessages = JSON.parse(saved);
          setState(prev => ({ ...prev, queuedMessages }));
        } catch (error) {
          console.error('Error loading queued messages:', error);
        }
      }
    }
  }, [roomId, state.queuedMessages, state.sendingQueue]);

  // Process queued messages when coming back online
  const processMessageQueue = useCallback(async () => {
    if (!roomId || state.sendingQueue || state.queuedMessages.length === 0) return;

    setState(prev => ({ ...prev, sendingQueue: true }));

    const messagesToProcess = [...state.queuedMessages];
    const failedMessages: QueuedMessage[] = [];

    for (const queuedMsg of messagesToProcess) {
      try {
        // Send message directly using the utility function
        await sendMessageDirectly(roomId, queuedMsg.message);

        // Remove successfully sent message from queue
        setState(prev => ({
          ...prev,
          queuedMessages: prev.queuedMessages.filter(msg => msg.id !== queuedMsg.id)
        }));

      } catch (error) {
        console.error('Failed to send queued message:', error);
        queuedMsg.retryCount++;

        // If message failed 3 times, give up
        if (queuedMsg.retryCount < 3) {
          failedMessages.push(queuedMsg);
        }
      }
    }

    setState(prev => ({
      ...prev,
      queuedMessages: failedMessages,
      sendingQueue: false
    }));
  }, [roomId, state.queuedMessages, state.sendingQueue]);

  // Save queued messages to localStorage whenever queue changes
  useEffect(() => {
    if (roomId && state.queuedMessages.length > 0) {
      localStorage.setItem(`chat_queue_${roomId}`, JSON.stringify(state.queuedMessages));
    } else if (roomId && state.queuedMessages.length === 0) {
      localStorage.removeItem(`chat_queue_${roomId}`);
    }
  }, [state.queuedMessages, roomId]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (roomId) {
        processMessageQueue();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [roomId, processMessageQueue]);

  // Add message to queue when offline
  const queueMessage = useCallback((message: string) => {
    if (!roomId || !message.trim()) return;

    const queuedMessage: QueuedMessage = {
      id: `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      message: message.trim(),
      timestamp: Date.now(),
      retryCount: 0
    };

    setState(prev => ({
      ...prev,
      queuedMessages: [...prev.queuedMessages, queuedMessage]
    }));

    return queuedMessage.id;
  }, [roomId]);

  // Remove message from queue
  const removeFromQueue = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      queuedMessages: prev.queuedMessages.filter(msg => msg.id !== messageId)
    }));
  }, []);

  // Clear all queued messages
  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queuedMessages: []
    }));
    if (roomId) {
      localStorage.removeItem(`chat_queue_${roomId}`);
    }
  }, [roomId]);

  // Get queue status for UI
  const getQueueStatus = useCallback(() => {
    const pendingCount = state.queuedMessages.length;
    const isOnline = state.isOnline;

    if (isOnline && pendingCount === 0) {
      return { status: 'online', message: 'All messages sent' };
    } else if (isOnline && pendingCount > 0) {
      return { status: 'sending', message: `Sending ${pendingCount} queued message${pendingCount > 1 ? 's' : ''}...` };
    } else if (!isOnline && pendingCount > 0) {
      return { status: 'offline', message: `${pendingCount} message${pendingCount > 1 ? 's' : ''} queued for sending` };
    } else {
      return { status: 'offline', message: 'You\'re offline' };
    }
  }, [state.isOnline, state.queuedMessages.length]);

  return {
    isOnline: state.isOnline,
    queuedMessages: state.queuedMessages,
    sendingQueue: state.sendingQueue,
    queueMessage,
    removeFromQueue,
    clearQueue,
    processMessageQueue,
    getQueueStatus
  };
};