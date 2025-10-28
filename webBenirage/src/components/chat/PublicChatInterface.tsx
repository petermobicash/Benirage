import React, { useState } from 'react';
import { MessageSquare, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';
import GuestChatEntry from './GuestChatEntry';
import EnhancedChatRoom from './EnhancedChatRoom';
import { useOfflineChat } from '../../hooks/useOfflineChat';
import Card from '../ui/Card';

interface PublicChatInterfaceProps {
  roomId?: string;
}

type ChatState = 'entry' | 'chat' | 'offline';

const PublicChatInterface: React.FC<PublicChatInterfaceProps> = ({ roomId = 'public-support' }) => {
  const [chatState, setChatState] = useState<ChatState>('entry');
  const [guestUser, setGuestUser] = useState<{ name: string; email: string } | null>(null);
  const { isOnline, queuedMessages, getQueueStatus } = useOfflineChat(roomId);

  const handleJoinChat = (guestInfo: { name: string; email: string }) => {
    setGuestUser(guestInfo);
    setChatState(isOnline ? 'chat' : 'offline');
  };

  const handleBackToEntry = () => {
    setChatState('entry');
    setGuestUser(null);
  };

  const queueStatus = getQueueStatus();

  const renderOfflineQueue = () => {
    if (chatState !== 'offline' || queuedMessages.length === 0) return null;

    return (
      <Card className="mb-4 border-orange-200 bg-orange-50">
        <div className="flex items-center space-x-3 p-4">
          <Clock className="w-5 h-5 text-orange-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">
              {queueStatus.message}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Messages will be sent automatically when you're back online
            </p>
          </div>
          {queueStatus.status === 'sending' && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
              <span className="text-xs text-orange-600">Sending...</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderConnectionStatus = () => {
    const status = queueStatus;

    return (
      <div className={`flex items-center space-x-2 text-sm ${
        status.status === 'online' ? 'text-green-600' :
        status.status === 'sending' ? 'text-blue-600' :
        'text-orange-600'
      }`}>
        {status.status === 'online' ? <Wifi className="w-4 h-4" /> :
         status.status === 'sending' ? <CheckCircle className="w-4 h-4" /> :
         <WifiOff className="w-4 h-4" />}
        <span>{status.message}</span>
      </div>
    );
  };

  if (chatState === 'entry') {
    return (
      <div className="w-full max-w-none mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            Welcome to BENIRAGE Support Chat
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Get instant help from our support team. We're here to assist you with any questions or concerns.
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center">
          {renderConnectionStatus()}
        </div>

        {/* Guest Entry Form */}
        <GuestChatEntry
          onJoinChat={handleJoinChat}
          loading={false}
        />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Support</h3>
            <p className="text-sm text-gray-600">
              Get real-time help from our support team
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Always Available</h3>
            <p className="text-sm text-gray-600">
              Chat works even when you're offline
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Notifications</h3>
            <p className="text-sm text-gray-600">
              Get notified when admins reply
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (chatState === 'offline') {
    return (
      <div className="w-full max-w-none mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Offline Chat</h2>
            <p className="text-gray-600">You're currently offline, but you can still send messages</p>
          </div>
          <button
            onClick={handleBackToEntry}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Entry
          </button>
        </div>

        {/* Offline Queue Status */}
        {renderOfflineQueue()}

        {/* Offline Chat Interface */}
        <Card className="min-h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You're Offline</h3>
            <p className="text-gray-600 mb-4">
              Don't worry! You can still type messages and they'll be sent automatically when you're back online.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong><br />
                • Type your message below<br />
                • It will be saved locally<br />
                • Sent automatically when online<br />
                • You'll get email notifications for replies
              </p>
            </div>
          </div>
        </Card>

        {/* Queue Management */}
        {queuedMessages.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Queued Messages ({queuedMessages.length})</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queuedMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700 truncate flex-1 mr-2">
                    {msg.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Chat state
  return (
    <div className="w-full max-w-none mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Chat with Support</h2>
          <p className="text-gray-600">
            Welcome back, {guestUser?.name}! {renderConnectionStatus()}
          </p>
        </div>
        <button
          onClick={handleBackToEntry}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Change User
        </button>
      </div>

      {/* Offline Queue Status */}
      {renderOfflineQueue()}

      {/* Chat Room */}
      <EnhancedChatRoom
        roomId={roomId}
        guestUser={guestUser || undefined}
        onClose={handleBackToEntry}
      />
    </div>
  );
};

export default PublicChatInterface;