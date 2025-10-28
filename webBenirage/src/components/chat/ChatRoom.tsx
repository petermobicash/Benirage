import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Paperclip, Smile, Users, Phone, Video, MessageSquare } from 'lucide-react';
import { useRealTimeChat, WhatsAppMessage, UserProfile } from '../../hooks/useRealTimeChat';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getCurrentUser } from '../../lib/supabase';

interface Attachment {
  type: string;
  url: string;
  name: string;
  size?: number;
}

interface ChatRoomProps {
  roomId: string;
  onClose?: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, onClose }) => {
  const navigate = useNavigate();
  const { chatState, isLoading, sendMessage } = useRealTimeChat({ groupId: roomId });
  const [messageText, setMessageText] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: WhatsAppMessage) => {
    const isOwnMessage = message.sender_id === currentUser?.id;

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
            <p className="whitespace-pre-wrap">{message.message_text}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment: Attachment, index: number) => (
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
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-lg">Authentication Required</div>
          <p className="text-gray-600 mb-4">Please log in to access this chat room.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm mx-auto mb-4">
            <p className="text-sm text-blue-700">
              <strong>Demo Accounts:</strong><br />
              Admin: admin@benirage.org / admin123<br />
              Content Manager: content@benirage.org / content123<br />
              Membership: membership@benirage.org / member123<br />
              Initiator: initiator@benirage.org / init123<br />
              Reviewer: reviewer@benirage.org / review123<br />
              Publisher: publisher@benirage.org / publish123<br />
              Membership: membership@benirage.org / member123
            </p>
          </div>
          <Button onClick={() => navigate('/admin/login')}>
            Go to Login Page
          </Button>
        </div>
      </Card>
    );
  }

  if (chatState.error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading chat</div>
          <p className="text-gray-600">{chatState.error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="font-semibold text-dark-blue">
              Chat Room
            </h3>
            <p className="text-sm text-gray-500">
              {chatState.onlineUsers?.filter(u => u.is_online).length || 0} online
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" type="button">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button type="submit" size="sm" disabled={!messageText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-gray-200 p-4">
            <h4 className="font-semibold text-dark-blue mb-4">
              Online Users ({chatState.onlineUsers.length})
            </h4>
            <div className="space-y-2">
              {chatState.onlineUsers.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {user.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.display_name || user.username || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.status}</p>
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

export default ChatRoom;