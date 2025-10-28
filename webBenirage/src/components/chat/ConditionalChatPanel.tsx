import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Wifi, WifiOff } from 'lucide-react';
import { useRealTimeChat } from '../../hooks/useRealTimeChat';
import WhatsAppChat from './WhatsAppChat';
import UserProfileManager from './UserProfileManager';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ConditionalChatPanelProps {
  className?: string;
}

const ConditionalChatPanel: React.FC<ConditionalChatPanelProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasOnlineUsers, setHasOnlineUsers] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  const { chatState, isLoading } = useRealTimeChat({
    enabled: true,
  });

  // Fallback mechanism: if loading takes too long, make chat available anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setConnectionTimeout(true);
        console.log('Chat connection timeout - making chat available');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Check if there are any online users (excluding current user)
  useEffect(() => {
    if (chatState.onlineUsers.length > 0 && chatState.currentUser) {
      const otherOnlineUsers = chatState.onlineUsers.filter(
        user => user.user_id !== chatState.currentUser?.user_id
      );
      setHasOnlineUsers(otherOnlineUsers.length > 0);
    } else if (chatState.currentUser) {
      // If we have a current user but no online users list, assume chat should be available
      // This handles cases where presence tracking might not be working perfectly
      setHasOnlineUsers(true);
    } else {
      setHasOnlineUsers(false);
    }
  }, [chatState.onlineUsers, chatState.currentUser]);

  // Don't render anything if no users are online and not loading and no timeout
  if (!hasOnlineUsers && !isLoading && !connectionTimeout) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <Card className="p-4 bg-gray-100 border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-gray-500">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm">No users online</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Chat will be available when other users come online
          </p>
        </Card>
      </div>
    );
  }

  // Show loading state while checking online users
  if (isLoading) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Connecting...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 ${className}`}>
        {/* Chat Toggle Button */}
        {!isExpanded && (
          <Card className="p-3 bg-blue-600 text-white border-blue-600 shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(true)}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                {chatState.isConnected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">Chat</div>
                <div className="text-xs opacity-90">
                  {chatState.onlineUsers.length} online
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Expanded Chat Panel */}
        {isExpanded && (
          <div className="relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-md hover:bg-gray-50"
            >
              ✕
            </Button>

            {/* Chat Interface */}
            <div className="w-96 h-[600px]">
              <WhatsAppChat onClose={() => setIsExpanded(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Online Users Indicator */}
      <div className={`fixed top-4 right-4 ${className}`}>
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {chatState.onlineUsers.length} Online
              </span>
            </div>

            {/* Online Users Avatars */}
            <div className="flex -space-x-2">
              {chatState.onlineUsers.slice(0, 3).map((user, index) => (
                <div
                  key={user.user_id}
                  className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center"
                  style={{ zIndex: 10 - index }}
                >
                  <span className="text-xs text-white font-semibold">
                    {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              {chatState.onlineUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-semibold">
                    +{chatState.onlineUsers.length - 3}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
              className="ml-2"
            >
              <Users className="w-4 h-4 text-green-600" />
            </Button>
          </div>

          {/* Show notification when users come online */}
          <div className="mt-2 text-xs text-green-700">
            Chat is now available - users are online!
          </div>
        </Card>
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <UserProfileManager onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default ConditionalChatPanel;