import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Users, Phone, Video, MessageSquare, Volume2, VolumeX, Link as LinkIcon } from 'lucide-react';
import { useRealTimeChat, WhatsAppMessage } from '../../hooks/useRealTimeChat';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getCurrentUser } from '../../lib/supabase';

// Define attachment type based on WhatsAppMessage interface
interface MessageAttachment {
  type: string;
  url: string;
  name: string;
  size?: number;
}

interface EnhancedChatRoomProps {
  roomId: string;
  guestUser?: { name: string; email: string };
  onClose?: () => void;
}

const EnhancedChatRoom: React.FC<EnhancedChatRoomProps> = ({ roomId, guestUser, onClose }) => {
  const { chatState, isLoading, sendMessage } = useRealTimeChat({ groupId: roomId });
  const [messageText, setMessageText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji picker data
  const emojis = ['😊', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯'];

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Track unread messages
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setUnreadCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Play sound for new messages
  useEffect(() => {
    if (chatState.messages.length > 0 && soundEnabled) {
      const lastMessage = chatState.messages[chatState.messages.length - 1];
      if (lastMessage.sender_id !== currentUser?.id && !document.hasFocus()) {
        playNotificationSound();
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [chatState.messages, currentUser?.id, soundEnabled]);

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCuR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBC');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Audio playback not supported:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Error sending message:', err);
      // Handle error if needed
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file.name);
      // You would implement actual file upload to Supabase storage here
    }
  };

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const renderLinkPreview = (url: string) => {
    // Simple link preview - in a real app you'd fetch metadata
    const domain = new URL(url).hostname;
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
        <div className="flex items-center space-x-2">
          <LinkIcon className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-600 font-medium">{domain}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1 truncate">{url}</p>
      </div>
    );
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: WhatsAppMessage) => {
    const isOwnMessage = message.sender_id === currentUser?.id ||
                         (guestUser && message.sender_name === guestUser.name);

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {!isOwnMessage && (
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {message.sender_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{message.sender_name}</span>
              <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
            </div>
          )}

          <div className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}>
            {message.reply_to_id && (
              <div className={`text-xs mb-2 pb-2 border-b ${
                isOwnMessage ? 'border-blue-500 text-blue-100' : 'border-gray-300 text-gray-600'
              }`}>
                Replying to message
              </div>
            )}

            <p className="whitespace-pre-wrap">{message.message_text}</p>

            {/* Link previews */}
            {extractLinks(message.message_text).map((url, index) => (
              <div key={index}>
                {renderLinkPreview(url)}
              </div>
            ))}

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment: MessageAttachment, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Paperclip className="w-4 h-4" />
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {attachment.name}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {isOwnMessage && (
              <div className="text-xs text-blue-100 mt-1 text-right">
                {formatMessageTime(message.created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <Card className="min-h-96 flex items-center justify-center">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </Card>
    );
  }


  return (
    <Card className="h-full flex flex-col min-h-96">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="font-semibold text-dark-blue">
              {'Chat Room'}
            </h3>
            <p className="text-sm text-gray-500">
              {chatState.onlineUsers.filter(p => p.is_online).length} online
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatState.messages.length > 0 ? (
              chatState.messages.map(message => renderMessage(message))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base placeholder-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="grid grid-cols-5 gap-1">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" size="sm" disabled={!messageText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-gray-200 p-4 hidden md:block">
            <h4 className="font-semibold text-dark-blue mb-4">
              Participants ({chatState.onlineUsers.length})
            </h4>
            <div className="space-y-2">
              {chatState.onlineUsers.map(participant => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative">
                    {participant.avatar_url ? (
                      <img
                        src={participant.avatar_url}
                        alt={participant.display_name || participant.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {(participant.display_name || participant.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {participant.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participant.display_name || participant.username}
                    </p>
                    <p className="text-xs text-gray-500">{participant.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedChatRoom;