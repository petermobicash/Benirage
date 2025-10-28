import React, { useState } from 'react';
import { MessageCircle, Users, Wifi, CheckCircle, X } from 'lucide-react';
import ConditionalChatPanel from '../components/chat/ConditionalChatPanel';
import WhatsAppChat from '../components/chat/WhatsAppChat';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const WhatsAppChatDemo: React.FC = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp-Style Chat System</h1>
                <p className="text-sm text-gray-500">Real-time messaging with presence detection</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowChat(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Start Chat Demo</span>
              </Button>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">System Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Overview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features Implemented</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-Time Messaging</h3>
                    <p className="text-sm text-gray-600">Instant message delivery using Supabase WebSocket connections</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">User Presence Detection</h3>
                    <p className="text-sm text-gray-600">Real-time online/offline status with last seen timestamps</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Typing Indicators</h3>
                    <p className="text-sm text-gray-600">See when other users are typing in real-time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Message Read Receipts</h3>
                    <p className="text-sm text-gray-600">Track message delivery and read status</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Conditional Chat Panel</h3>
                    <p className="text-sm text-gray-600">Chat only appears when other users are online</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">User Profile Management</h3>
                    <p className="text-sm text-gray-600">Complete profile system with status and privacy settings</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Test</h3>

              <div className="space-y-3 text-sm text-gray-600">
                <p>1. <strong>Open multiple browser tabs/windows</strong> to simulate different users</p>
                <p>2. <strong>Log in with different accounts</strong> in each tab (admin@benirage.org, content@benirage.org, etc.)</p>
                <p>3. <strong>Set different online statuses</strong> in each profile</p>
                <p>4. <strong>Start conversations</strong> between the accounts</p>
                <p>5. <strong>Watch real-time updates</strong> as you type and send messages</p>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Accounts:</strong><br />
                  • admin@benirage.org / admin123<br />
                  • content@benirage.org / content123<br />
                  • membership@benirage.org / member123<br />
                  • initiator@benirage.org / init123<br />
                  • reviewer@benirage.org / review123<br />
                  • publisher@benirage.org / publish123<br />
                  • membership@benirage.org / member123
                </p>
              </div>
            </Card>
          </div>

          {/* Technical Implementation */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Architecture</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Database Schema</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-xs">
                    • user_profiles - Enhanced user management<br />
                    • direct_messages - 1-to-1 messaging<br />
                    • group_chats - Group management<br />
                    • group_messages - Group messaging<br />
                    • message_read_receipts - Read status tracking<br />
                    • typing_indicators - Real-time typing<br />
                    • user_presence - Online status tracking
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-Time Infrastructure</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-xs">
                    • Supabase Realtime WebSocket<br />
                    • PostgreSQL subscriptions<br />
                    • Presence tracking<br />
                    • Automatic reconnection
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Frontend Components</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-xs">
                    • useRealTimeChat hook<br />
                    • WhatsAppChat component<br />
                    • UserProfileManager<br />
                    • ConditionalChatPanel
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wifi className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Smart Availability</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Chat panel only appears when other users are online, reducing UI clutter and improving user experience.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Live Presence</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Real-time user status updates with online indicators, last seen timestamps, and custom status messages.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Instant Messaging</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sub-second message delivery with typing indicators, read receipts, and message status tracking.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Chat Component */}
            <div className="h-[600px]">
              <WhatsAppChat onClose={() => setShowChat(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <ConditionalChatPanel />
    </div>
  );
};

export default WhatsAppChatDemo;