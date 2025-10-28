import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users, Volume2, VolumeX, Reply, Heart, ThumbsUp, Smile, Paperclip, MoreVertical, Search, X, Pin, Star, Mic, Settings, Shield } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getCurrentUser, supabase } from '../../lib/supabase';
import VoiceRecorder from './VoiceRecorder';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import VideoCallButton from './VideoCallButton';
import GuestChatEntry from './GuestChatEntry';
import { usePermission } from '../../hooks/usePermissions';

interface OnlineUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  status: string;
  role: string;
}

interface Attachment {
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size: number;
  duration?: number;
}

interface ChatMessage {
  id: string;
  room_id: string | null;
  sender_id: string | null;
  sender_name: string;
  sender_avatar: string | null;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification';
  reply_to_id: string | null;
  mentions: Record<string, unknown>;
  attachments: Attachment[];
  reactions: Record<string, unknown>;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  message_status: 'sent' | 'delivered' | 'seen';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

interface GeneralChatProps {
  onClose?: () => void;
}

const GeneralChat: React.FC<GeneralChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [starredMessages, setStarredMessages] = useState<ChatMessage[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [voiceMessageBlob, setVoiceMessageBlob] = useState<Blob | null>(null);
  const [voiceMessageDuration, setVoiceMessageDuration] = useState<number>(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Permission hooks for chat management
  const { hasPermission: canModerateChat } = usePermission('chat.moderate');
  const { hasPermission: canManageChat } = usePermission('chat.manage_settings');
  const { hasPermission: canViewChatAnalytics } = usePermission('chat.view_analytics');

  // Enhanced online users with better mock data for demo
  useEffect(() => {
    if (userInfo) {
      setOnlineUsers([
        {
          id: currentUser?.id || 'guest-user',
          display_name: userInfo.name,
          username: userInfo.email,
          avatar_url: null,
          status: 'online',
          role: currentUser ? 'member' : 'guest'
        },
        {
          id: 'admin-user',
          display_name: 'Community Moderator',
          username: 'moderator',
          avatar_url: null,
          status: 'online',
          role: 'moderator'
        },
        {
          id: 'user-2',
          display_name: 'Sarah Johnson',
          username: 'sarah_j',
          avatar_url: null,
          status: 'online',
          role: 'member'
        }
      ]);
    } else {
      setOnlineUsers([]);
    }
  }, [currentUser, userInfo]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000); // Stop typing indicator after 3 seconds of inactivity
    setTypingTimeout(timeout);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    }
  };

  // Handle voice message recording completion
  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    setVoiceMessageBlob(audioBlob);
    setVoiceMessageDuration(duration);
    setShowVoiceRecorder(false);
  };

  // Handle voice message upload
  const handleVoiceMessageUpload = async () => {
    if (!voiceMessageBlob) return;

    try {
      const fileName = `voice-message-${Date.now()}.webm`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, voiceMessageBlob);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      // Create voice message
      const voiceMessageData = {
        sender_id: currentUser?.id || null,
        sender_name: userInfo?.name || 'User',
        message_text: '🎤 Voice message',
        message_type: 'audio',
        reply_to_id: replyingTo?.id || null,
        attachments: [{
          type: 'audio',
          url: data.publicUrl,
          name: fileName,
          size: voiceMessageBlob.size,
          duration: voiceMessageDuration
        }],
        message_status: 'sent',
        metadata: {
          timestamp: new Date().toISOString(),
          client_id: currentUser?.id || 'guest',
          message_length: 0,
          audio_duration: voiceMessageDuration,
          user_email: userInfo?.email || ''
        },
        room_id: null,
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([voiceMessageData]);

      if (error) {
        throw error;
      }

      // Clear voice message data
      setVoiceMessageBlob(null);
      setVoiceMessageDuration(0);

    } catch (error) {
      console.error('Error uploading voice message:', error);
      alert('Failed to send voice message. Please try again.');
    }
  };

  // Handle pinning messages
  const handlePinMessage = (message: ChatMessage) => {
    if (pinnedMessages.some(m => m.id === message.id)) {
      setPinnedMessages(prev => prev.filter(m => m.id !== message.id));
    } else {
      setPinnedMessages(prev => [...prev, message]);
    }
  };

  // Handle starring messages
  const handleStarMessage = (message: ChatMessage) => {
    if (starredMessages.some(m => m.id === message.id)) {
      setStarredMessages(prev => prev.filter(m => m.id !== message.id));
    } else {
      setStarredMessages(prev => [...prev, message]);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load messages and set up real-time subscription
  useEffect(() => {
    // Load messages for both authenticated and anonymous users
    loadMessages();
    const cleanup = setupRealtimeSubscription();

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, setting sample data');
        setIsLoading(false);
        setMessages([
          {
            id: '1',
            room_id: null,
            sender_id: 'demo-user',
            sender_name: 'Demo User',
            sender_avatar: null,
            message_text: 'Welcome to the BENIRAGE community chat! 👋',
            message_type: 'text',
            reply_to_id: null,
            mentions: {},
            attachments: [],
            reactions: {},
            is_edited: false,
            is_deleted: false,
            is_pinned: false,
            message_status: 'sent',
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            edited_at: null,
            deleted_at: null,
          }
        ]);
      }
    }, 5000);

    return () => {
      cleanup();
      clearTimeout(timeout);
    };
  }, [currentUser, isLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea when component is ready
  useEffect(() => {
    if (!isLoading && !authLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, authLoading]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Handle message search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = messages.filter(message =>
      message.message_text.toLowerCase().includes(query) ||
      message.sender_name.toLowerCase().includes(query)
    );
    setSearchResults(results);
  }, [searchQuery, messages]);

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Check if user has provided their information
      let userInformation = null;

      if (user) {
        // For authenticated users, check if they have name and email in their profile
        const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
        const email = user.email;

        if (displayName && email) {
          userInformation = { name: displayName, email: email };
        }
      } else {
        // For anonymous users, check localStorage
        const storedInfo = localStorage.getItem('benirage_chat_user_info');
        if (storedInfo) {
          try {
            userInformation = JSON.parse(storedInfo);
          } catch (e) {
            console.error('Error parsing stored user info:', e);
            localStorage.removeItem('benirage_chat_user_info');
          }
        }
      }

      setUserInfo(userInformation);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setCurrentUser(null);
      setUserInfo(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestInfoSubmit = (guestInfo: { name: string; email: string }) => {
    // Store in localStorage for anonymous users
    localStorage.setItem('benirage_chat_user_info', JSON.stringify(guestInfo));
    setUserInfo(guestInfo);
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      console.log('Loading messages from database...');

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Database error loading messages:', error);
        throw error;
      }

      console.log('Loaded messages:', data?.length || 0);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // For demo purposes, set some sample messages if DB fails
      setMessages([
        {
          id: '1',
          room_id: null,
          sender_id: 'demo-user',
          sender_name: 'Demo User',
          sender_avatar: null,
          message_text: 'Welcome to the BENIRAGE community chat! 👋',
          message_type: 'text',
          reply_to_id: null,
          mentions: {},
          attachments: [],
          reactions: {},
          is_edited: false,
          is_deleted: false,
          is_pinned: false,
          message_status: 'sent',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          edited_at: null,
          deleted_at: null,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    try {
      console.log('Setting up real-time subscription...');
      const channel = supabase
        .channel('general-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
          },
          (payload) => {
            console.log('New message received:', payload.new);
            if (payload.new && !payload.new.is_deleted) {
              setMessages(prev => [...prev, payload.new as ChatMessage]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
          },
          (payload) => {
            console.log('Message updated:', payload.new);
            if (payload.new) {
              setMessages(prev => prev.map(msg =>
                String(msg.id) === String(payload.new.id) ? payload.new as ChatMessage : msg
              ));
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Cleaning up subscription...');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      return () => {};
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !selectedFile) || sending) return;

    // Validate message length
    if (messageText.trim().length > 1000) {
      alert('Message is too long. Please keep it under 1000 characters.');
      return;
    }

    try {
      setSending(true);
      setConnectionStatus('connecting');

      let attachments: Attachment[] = [];
      let messageType: 'text' | 'image' | 'file' = 'text';

      if (selectedFile) {
        const fileUrl = await handleFileUpload(selectedFile);
        if (fileUrl) {
          attachments = [{
            type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            url: fileUrl,
            name: selectedFile.name,
            size: selectedFile.size
          }];
          messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
        }
        setSelectedFile(null);
      }

      // Use stored user information for both authenticated and anonymous users
      const messageData = {
        sender_id: currentUser?.id || null,
        sender_name: userInfo?.name || 'User',
        message_text: messageText.trim(),
        message_type: messageType,
        reply_to_id: replyingTo?.id || null,
        attachments,
        message_status: 'sent',
        metadata: {
          timestamp: new Date().toISOString(),
          client_id: currentUser?.id || 'guest',
          message_length: messageText.trim().length,
          user_email: userInfo?.email || ''
        },
        room_id: null,
      };

      console.log('Sending message:', messageData);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Database error:', error);
        setConnectionStatus('disconnected');

        // Show user-friendly error message
        if (error.code === '23502') {
          alert('Failed to send message. Please check your connection and try again.');
        } else {
          alert(`Failed to send message: ${error.message}`);
        }

        return;
      }

      console.log('Message sent successfully:', data);
      setConnectionStatus('connected');
      setMessageText('');
      setIsTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      setReplyingTo(null);

      // Clear voice message data after successful send
      setVoiceMessageBlob(null);
      setVoiceMessageDuration(0);

      // Show success feedback briefly
      setTimeout(() => {
        // Optional: Show a subtle success indicator
      }, 1000);

    } catch (err) {
      console.error('Error sending message:', err);
      setConnectionStatus('disconnected');
      alert('Failed to send message. Please check your internet connection and try again.');
    } finally {
      setSending(false);
      setIsTyping(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = (message: ChatMessage, isReply = false) => {
    const isOwnMessage = message.sender_id === currentUser?.id;

    // Group messages by date
    const messageDate = formatMessageDate(message.created_at);

    return (
      <div key={message.id} className="group">
        {/* Date separator */}
        {!isReply && (
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium px-4 py-2 rounded-full shadow-sm">
              {messageDate}
            </div>
          </div>
        )}

        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isReply ? 'ml-12' : ''}`}>
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
            {!isOwnMessage && !isReply && (
              <div className="flex items-center space-x-3 mb-2 px-1">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    <span className="text-white text-sm font-semibold">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {message.sender_id !== 'demo-user' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{message.sender_name}</span>
                  <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
                </div>
              </div>
            )}

            {/* Reply context */}
            {message.reply_to_id && (
              <div className={`text-xs mb-2 px-3 py-2 rounded-md border-l-4 ${
                isOwnMessage
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <Reply className="w-3 h-3" />
                  <span className="font-medium">Replying to a message</span>
                </div>
              </div>
            )}

            <div className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
              isOwnMessage
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-3">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="mb-2">
                      {attachment.type === 'image' ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      ) : attachment.type === 'audio' ? (
                        <div className="max-w-xs">
                          <VoiceMessagePlayer
                            audioUrl={attachment.url}
                            duration={attachment.duration}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {attachment.name}
                          </a>
                          <span className="text-xs text-gray-500">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message content with better formatting */}
              <div className="text-sm leading-relaxed">
                {message.message_text.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < message.message_text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>

              {/* Message timestamp for own messages */}
              {isOwnMessage && (
                <div className="text-xs text-blue-100 mt-2 text-right opacity-75 flex items-center justify-end space-x-1">
                  <span>{formatMessageTime(message.created_at)}</span>
                  {message.is_edited && <span>(edited)</span>}
                  <span className="ml-1">
                    {message.message_status === 'sent' && '✅'}
                    {message.message_status === 'delivered' && '✅✅'}
                    {message.message_status === 'seen' && '👁️'}
                  </span>
                </div>
              )}

              {/* Message status indicator */}
              {isOwnMessage && (
                <div className="absolute -bottom-1 -right-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced message actions */}
            {!isReply && (
              <div className={`flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReply(message)}
                  className="text-xs p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Reply className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs p-2 h-auto text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Heart className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs p-2 h-auto text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePinMessage(message)}
                  className={`text-xs p-2 h-auto rounded-full transition-colors ${
                    pinnedMessages.some(m => m.id === message.id)
                      ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStarMessage(message)}
                  className={`text-xs p-2 h-auto rounded-full transition-colors ${
                    starredMessages.some(m => m.id === message.id)
                      ? 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Chat</h3>
            <p className="text-sm text-gray-600">Connecting to community...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Show guest entry form if user info is not available
  if (!userInfo) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <GuestChatEntry onJoinChat={handleGuestInfoSubmit} loading={authLoading} />
      </div>
    );
  }

  return (
    <div className="h-[600px] flex flex-col bg-white shadow-xl border-0 overflow-hidden rounded-2xl">
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-300 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>General Discussion</span>
            </h3>
            <p className="text-sm text-blue-100 flex items-center space-x-2">
              <span>Community chat</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{onlineUsers.length} online</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                connectionStatus === 'connected'
                  ? 'bg-green-500 text-white'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-white hover:bg-white/20 rounded-full p-2 ${soundEnabled ? 'bg-white/10' : 'bg-white/5'}`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Video Call Button */}
          <VideoCallButton
            conversationId={`general_${currentUser?.id || 'anonymous'}`}
            participants={onlineUsers.map(u => u.id)}
            className="text-white hover:bg-white/20 rounded-full p-2"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMessageSearch(!showMessageSearch)}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Admin Panel Button - only show for users with chat management permissions */}
          {(canModerateChat || canManageChat) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className={`rounded-full p-2 ${showAdminPanel ? 'bg-white/20 text-white' : 'text-white hover:bg-white/20'}`}
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 ml-2"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Pin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Pinned Messages</span>
          </div>
          <div className="space-y-1">
            {pinnedMessages.slice(0, 3).map((message) => (
              <div
                key={message.id}
                className="p-2 bg-white rounded-lg text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  const messageElement = document.getElementById(`message-${message.id}`);
                  if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="font-medium">{message.sender_name}:</span> {message.message_text.substring(0, 50)}...
              </div>
            ))}
            {pinnedMessages.length > 3 && (
              <div className="text-xs text-blue-600 cursor-pointer hover:underline">
                +{pinnedMessages.length - 3} more pinned
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Search Overlay */}
      {showMessageSearch && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-10">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessageSearch(false)}
              >
                ✕
              </Button>
            </div>

            {/* Search Results */}
            <div className="mt-4 max-h-64 overflow-y-auto">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 px-2 py-1">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    {searchResults.map((message) => (
                      <div
                        key={message.id}
                        className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          // Scroll to message
                          const messageElement = document.getElementById(`message-${message.id}`);
                          if (messageElement) {
                            messageElement.scrollIntoView({ behavior: 'smooth' });
                          }
                          setShowMessageSearch(false);
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{message.sender_name}</span>
                          <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {message.message_text.length > 100
                            ? message.message_text.substring(0, 100) + '...'
                            : message.message_text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No messages found</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Search messages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (canModerateChat || canManageChat) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-blue-900 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Chat Administration</span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdminPanel(false)}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {canModerateChat && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <Users className="w-4 h-4" />
                <span>Moderate Users</span>
              </Button>
            )}

            {canManageChat && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <Settings className="w-4 h-4" />
                <span>Chat Settings</span>
              </Button>
            )}

            {canViewChatAnalytics && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <MessageSquare className="w-4 h-4" />
                <span>View Analytics</span>
              </Button>
            )}

            {(canModerateChat || canManageChat) && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <Shield className="w-4 h-4" />
                <span>Export History</span>
              </Button>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                {onlineUsers.length} users online • {messages.length} total messages
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-blue-600 capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Enhanced Messages Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-1 bg-gradient-to-b from-gray-50/30 to-white">
            {messages.length > 0 ? (
              <>
                {messages.map(message => renderMessage(message))}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-4" />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12 px-6 max-w-md mx-auto">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MessageSquare className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white text-lg">💬</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Welcome to BENIRAGE Community Chat!</h3>
                  <p className="text-gray-600 mb-2">No messages yet. Be the first to start the conversation!</p>
                  <p className="text-sm text-gray-500">Share your thoughts, ask questions, or connect with the community. This is a safe space for meaningful discussions.</p>

                  {/* Quick suggestions */}
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Share ideas</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Ask questions</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Connect</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Reply indicator */}
          {replyingTo && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Reply className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Replying to {replyingTo.sender_name}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 truncate max-w-xs mt-1 pl-6">
                      "{replyingTo.message_text.length > 50
                        ? replyingTo.message_text.substring(0, 50) + '...'
                        : replyingTo.message_text}"
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelReply}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Message Input */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {/* User info notice for guests */}
            {!currentUser && userInfo && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Welcome to BENIRAGE Community Chat, {userInfo.name}!
                    </p>
                    <p className="text-sm text-green-700">
                      You're connected and ready to participate in the community discussion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      handleTyping();
                    }}
                    placeholder={
                      userInfo
                        ? `Share with the community, ${userInfo.name}...`
                        : "Share your thoughts..."
                    }
                    rows={messageText.split('\n').length > 3 ? 3 : messageText.split('\n').length + 1}
                    maxLength={1000}
                    disabled={sending}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  {/* Character count */}
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {messageText.length}/1000
                  </div>
                </div>

                {/* Enhanced action buttons */}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Voice Message Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                    className={`p-2 rounded-full transition-colors ${
                      showVoiceRecorder
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!messageText.trim() && !selectedFile && !voiceMessageBlob) || sending || messageText.length > 1000}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {sending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                  </div>
                  <span>Someone is typing...</span>
                </div>
              )}
            </form>

            {/* Voice Recorder */}
            {showVoiceRecorder && (
              <div className="mt-2">
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecordingComplete}
                  onCancel={() => setShowVoiceRecorder(false)}
                  maxDuration={300}
                />
              </div>
            )}

            {/* Voice Message Preview */}
            {voiceMessageBlob && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Voice Message Ready</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVoiceMessageBlob(null);
                      setVoiceMessageDuration(0);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <VoiceMessagePlayer
                  audioBlob={voiceMessageBlob}
                  duration={voiceMessageDuration}
                  className="mb-2"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleVoiceMessageUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Voice Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVoiceMessageBlob(null);
                      setVoiceMessageDuration(0);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-2">
                  {[
                    '😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉',
                    '😢', '😭', '😤', '😅', '🙄', '🤗', '😎', '🤩', '🥳',
                    '👌', '✌️', '🤞', '👏', '🙌', '🤝', '🙏', '💪',
                    '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
                    '🎈', '🎊', '🎁', '🎂', '🍰', '🌟', '✨', '💫', '⭐'
                  ].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Participants Sidebar */}
        {showParticipants && (
          <div className="w-72 border-l border-gray-200 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Community Members</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded-full shadow-sm">
                    {onlineUsers.length}
                  </span>
                </div>
              </div>

              {/* Search users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
              {onlineUsers.length > 0 ? (
                onlineUsers
                  .filter(user =>
                    searchTerm === '' ||
                    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(user => (
                    <div key={user.id} className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                      <div className="relative flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.display_name || user.username || 'User'}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200 shadow-sm"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-green-200 shadow-sm ${
                            user.role === 'moderator'
                              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                              : user.role === 'admin'
                              ? 'bg-gradient-to-br from-red-500 to-pink-600'
                              : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          }`}>
                            <span className="text-white text-sm font-bold">
                              {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white rounded-full animate-pulse shadow-lg"></div>

                        {/* Role indicator */}
                        {user.role === 'moderator' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">★</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.display_name || user.username || 'Anonymous'}
                          </p>
                          {user.role === 'moderator' && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              Mod
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span>{user.status}</span>
                          </p>
                          {user.role === 'guest' && (
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                              Guest
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No users online</p>
                  <p className="text-xs text-gray-400 mt-1">Community members will appear here</p>
                </div>
              )}
            </div>

            {/* Community stats footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{onlineUsers.length}</p>
                  <p className="text-xs text-gray-600">Online</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{messages.length}</p>
                  <p className="text-xs text-gray-600">Messages</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralChat;