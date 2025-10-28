import { useState } from 'react';
import { MessageSquare, Users, Settings, BarChart3 } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';
import ChatRoom from '../components/chat/ChatRoom';
import NotificationCenter from '../components/chat/NotificationCenter';
import AdminChatPanel from '../components/chat/AdminChatPanel';
import ActivityReports from '../components/chat/ActivityReports';
import SuggestionSystem from '../components/chat/SuggestionSystem';

const ChatDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'comments' | 'chat' | 'notifications' | 'admin' | 'reports' | 'suggestions'>('comments');
  const [demoContentId] = useState('demo-content-1');
  const [selectedRoomId] = useState('general-discussion');
  const [currentUserId] = useState('demo-user-1');

  const demoTabs: Array<{ id: 'comments' | 'chat' | 'notifications' | 'suggestions' | 'admin' | 'reports'; name: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
    { id: 'comments', name: 'Comments System', icon: MessageSquare, description: 'Threaded commenting with reactions' },
    { id: 'chat', name: 'Real-time Chat', icon: Users, description: 'Live chat rooms with participants' },
    { id: 'notifications', name: 'Notifications', icon: MessageSquare, description: 'Real-time notification center' },
    { id: 'suggestions', name: 'AI Suggestions', icon: MessageSquare, description: 'Content improvement suggestions' },
    { id: 'admin', name: 'Admin Panel', icon: Settings, description: 'Communication management dashboard' },
    { id: 'reports', name: 'Activity Reports', icon: BarChart3, description: 'Detailed analytics and reporting' }
  ];

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Real-time Communication System
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Comprehensive commenting, chat, and communication platform with activity logging and reporting
          </p>
        </div>
      </Section>

      {/* Features Overview */}
      <Section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Communication Features
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Enterprise-grade real-time communication with comprehensive monitoring and reporting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '💬',
              title: 'Threaded Comments',
              description: 'Nested comment system with reactions, mentions, and real-time updates'
            },
            {
              icon: '🚀',
              title: 'Real-time Chat',
              description: 'Live chat rooms with role-based access and participant management'
            },
            {
              icon: '🔔',
              title: 'Smart Notifications',
              description: 'Intelligent notification system with priority levels and filtering'
            },
            {
              icon: '🤖',
              title: 'AI Suggestions',
              description: 'AI-powered content improvement suggestions with confidence scoring'
            },
            {
              icon: '📊',
              title: 'Activity Logging',
              description: 'Comprehensive activity tracking with detailed audit trails'
            },
            {
              icon: '📈',
              title: 'Advanced Reports',
              description: 'Detailed analytics and exportable reports for all communications'
            }
          ].map((feature, index) => (
            <Card key={index} variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Demo Tabs */}
      <Section className="py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Interactive Demo
          </h2>
          <p className="text-xl text-gray-700">
            Explore each component of the communication system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demoTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeDemo === tab.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 shadow-md'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <div className="text-left">
                <div>{tab.name}</div>
                <div className="text-xs opacity-80">{tab.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="max-w-6xl mx-auto">
          {activeDemo === 'comments' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                💬 Threaded Comment System Demo
              </h3>
              <CommentSystem contentSlug={demoContentId} />
            </div>
          )}

          {activeDemo === 'chat' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🚀 Real-time Chat Room Demo
              </h3>
              <ChatRoom roomId={selectedRoomId} />
            </div>
          )}

          {activeDemo === 'notifications' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🔔 Notification Center Demo
              </h3>
              <NotificationCenter userId={currentUserId} />
            </div>
          )}

          {activeDemo === 'suggestions' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🤖 AI Content Suggestions Demo
              </h3>
              <SuggestionSystem contentId={demoContentId} />
            </div>
          )}

          {activeDemo === 'admin' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                ⚙️ Admin Communication Panel
              </h3>
              <AdminChatPanel />
            </div>
          )}

          {activeDemo === 'reports' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                📈 Activity Reports & Analytics
              </h3>
              <ActivityReports />
            </div>
          )}
        </div>
      </Section>

      {/* Technical Features */}
      <Section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Technical Capabilities
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Enterprise-grade features built for scalability and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🔄 Real-time Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Live message delivery with WebSocket connections</li>
              <li>• Real-time typing indicators and presence</li>
              <li>• Instant comment updates and reactions</li>
              <li>• Live participant status in chat rooms</li>
              <li>• Real-time notification delivery</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🛡️ Security & Moderation</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Role-based access control for all features</li>
              <li>• Content moderation with admin oversight</li>
              <li>• Spam detection and prevention</li>
              <li>• User reporting and blocking capabilities</li>
              <li>• Comprehensive audit logging</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📊 Analytics & Reporting</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Detailed activity tracking and logging</li>
              <li>• User engagement analytics</li>
              <li>• Content interaction metrics</li>
              <li>• Exportable reports in multiple formats</li>
              <li>• Real-time dashboard monitoring</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🎯 Advanced Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• AI-powered content suggestions</li>
              <li>• Mention system with notifications</li>
              <li>• File sharing and media attachments</li>
              <li>• Message threading and replies</li>
              <li>• Custom emoji reactions</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="py-20 bg-blue-900 text-white">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Engage Your Community?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Deploy this comprehensive communication system to foster meaningful connections and conversations
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg">
              Deploy Communication System
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              View Documentation
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ChatDemo;