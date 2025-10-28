import { useState } from 'react';
import { Zap, Sparkles, BarChart3, Search, Users, MessageSquare, GitBranch, Image, Shield, TrendingUp } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RealTimeCollaboration from '../components/advanced/RealTimeCollaboration';
import AIContentSuggestions from '../components/advanced/AIContentSuggestions';
import AdvancedNotifications from '../components/advanced/AdvancedNotifications';
import ContentAnalytics from '../components/advanced/ContentAnalytics';
import SmartSearch from '../components/advanced/SmartSearch';
import WorkflowAutomation from '../components/advanced/WorkflowAutomation';
import ContentVersioning from '../components/advanced/ContentVersioning';
import MediaOptimization from '../components/advanced/MediaOptimization';
import SecurityAudit from '../components/advanced/SecurityAudit';
import PerformanceMonitor from '../components/advanced/PerformanceMonitor';
import AdvancedUserManagement from '../components/advanced/AdvancedUserManagement';

interface ContentSuggestion {
  id: string;
  type: 'seo' | 'readability' | 'engagement' | 'accessibility' | 'performance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  suggestion: string;
  implementation: string;
  before?: string;
  after?: string;
}

type DemoType = 'collaboration' | 'ai' | 'notifications' | 'analytics' | 'search' | 'automation' | 'versioning' | 'media' | 'security' | 'performance' | 'users';

const AdvancedFeatures = () => {
  const [activeDemo, setActiveDemo] = useState<DemoType>('collaboration');
// Polyfill for crypto.randomUUID() for browser compatibility
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers that don't support crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

  const [demoContentId] = useState(() => generateUUID());
  const [demoUserId] = useState(() => generateUUID());
  const [demoContent, setDemoContent] = useState(`# Welcome to BENIRAGE

This is a sample content for demonstrating our advanced features. BENIRAGE is a spiritual and cultural movement that brings together communities through shared wisdom and heritage.

## Our Mission

We believe in the power of spiritual grounding, human philosophy, and cultural preservation to transform lives and communities.

What aspects of spiritual growth resonate most with your personal journey?`);

  const featureTabs = [
    { 
      id: 'collaboration', 
      name: 'Real-time Collaboration', 
      icon: Users, 
      description: 'Live editing with conflict prevention',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'ai', 
      name: 'AI Content Suggestions', 
      icon: Sparkles, 
      description: 'Smart content optimization',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'notifications', 
      name: 'Smart Notifications', 
      icon: MessageSquare, 
      description: 'Advanced notification system',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'analytics', 
      name: 'Content Analytics', 
      icon: BarChart3, 
      description: 'Detailed performance insights',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      id: 'search', 
      name: 'Smart Search', 
      icon: Search, 
      description: 'AI-powered search with filters',
      color: 'from-teal-500 to-cyan-600'
    },
    { 
      id: 'automation', 
      name: 'Workflow Automation', 
      icon: Zap, 
      description: 'Automated workflows and tasks',
      color: 'from-red-500 to-rose-600'
    },
    { 
      id: 'versioning', 
      name: 'Content Versioning', 
      icon: GitBranch, 
      description: 'Track changes with version control',
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      id: 'media', 
      name: 'Media Optimization', 
      icon: Image, 
      description: 'Optimize images and media files',
      color: 'from-pink-500 to-red-600'
    },
    { 
      id: 'security', 
      name: 'Security Audit', 
      icon: Shield, 
      description: 'Comprehensive security monitoring',
      color: 'from-gray-500 to-slate-600'
    },
    { 
      id: 'performance', 
      name: 'Performance Monitor', 
      icon: TrendingUp, 
      description: 'Real-time performance tracking',
      color: 'from-emerald-500 to-green-600'
    },
    { 
      id: 'users', 
      name: 'Advanced User Management', 
      icon: Users, 
      description: 'Comprehensive user administration',
      color: 'from-violet-500 to-purple-600'
    }
  ];

  const handleContentChange = (content: string) => {
    setDemoContent(content);
  };

  const handleApplySuggestion = (suggestion: ContentSuggestion) => {
    if (suggestion.after) {
      setDemoContent(prev => prev.replace(suggestion.before || '', suggestion.after || ''));
    }
  };

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="text-center">
          <Zap className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Advanced Features
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Enterprise-grade features that make BENIRAGE a cutting-edge platform
          </p>
        </div>
      </Section>

      {/* Features Overview */}
      <Section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Next-Generation CMS Features
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Advanced capabilities that set BENIRAGE apart from traditional content management systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🤝',
              title: 'Real-time Collaboration',
              description: 'Multiple users can edit content simultaneously with live cursors, conflict prevention, and automatic saving'
            },
            {
              icon: '🤖',
              title: 'AI-Powered Suggestions',
              description: 'Smart content optimization with SEO, readability, and engagement suggestions powered by AI'
            },
            {
              icon: '🔔',
              title: 'Intelligent Notifications',
              description: 'Context-aware notifications with priority levels, smart filtering, and browser integration'
            },
            {
              icon: '📊',
              title: 'Advanced Analytics',
              description: 'Comprehensive content performance tracking with user behavior insights and engagement metrics'
            },
            {
              icon: '🔍',
              title: 'Smart Search',
              description: 'AI-enhanced search with relevance scoring, filters, and intelligent suggestions'
            },
            {
              icon: '⚡',
              title: 'Workflow Automation',
              description: 'Automated content workflows, task assignment, and notification triggers'
            },
            {
              icon: '📝',
              title: 'Content Versioning',
              description: 'Complete version control with diff tracking, rollback capabilities, and collaboration history'
            },
            {
              icon: '🖼️',
              title: 'Media Optimization',
              description: 'Automatic image compression, format conversion, and CDN integration for optimal performance'
            },
            {
              icon: '🛡️',
              title: 'Security Audit',
              description: 'Comprehensive security monitoring with threat detection and compliance reporting'
            },
            {
              icon: '⚡',
              title: 'Performance Monitor',
              description: 'Real-time performance tracking with Core Web Vitals and optimization recommendations'
            },
            {
              icon: '👥',
              title: 'Advanced User Management',
              description: 'Sophisticated user administration with detailed profiles and permission management'
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

      {/* Interactive Demo */}
      <Section className="py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Interactive Feature Demo
          </h2>
          <p className="text-xl text-gray-700">
            Experience each advanced feature in action
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {featureTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id as DemoType)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeDemo === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'
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
          {activeDemo === 'collaboration' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🤝 Real-time Collaboration Demo
              </h3>
              <RealTimeCollaboration
                contentId={demoContentId}
                currentUser={{ id: 'demo-user', email: 'demo@benirage.org' }}
                onContentChange={handleContentChange}
              />
              <Card>
                <h4 className="font-semibold text-blue-900 mb-4">Demo Content Editor</h4>
                <textarea
                  value={demoContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </Card>
            </div>
          )}

          {activeDemo === 'ai' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🤖 AI Content Suggestions Demo
              </h3>
              <AIContentSuggestions
                content={demoContent}
                title="Welcome to BENIRAGE"
                contentType="post"
                contentId={demoContentId}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          )}

          {activeDemo === 'notifications' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🔔 Advanced Notifications Demo
              </h3>
              <AdvancedNotifications userId={demoUserId} />
            </div>
          )}

          {activeDemo === 'analytics' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                📊 Content Analytics Demo
              </h3>
              <ContentAnalytics contentId={demoContentId} />
            </div>
          )}

          {activeDemo === 'search' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🔍 Smart Search Demo
              </h3>
              <SmartSearch
                placeholder="Search BENIRAGE content, events, resources..."
                showFilters={true}
                onResultClick={(result) => console.log('Selected:', result)}
              />
            </div>
          )}

          {activeDemo === 'automation' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                ⚡ Workflow Automation Demo
              </h3>
              <WorkflowAutomation contentType="post" />
            </div>
          )}

          {activeDemo === 'versioning' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                📝 Content Versioning Demo
              </h3>
              <ContentVersioning
                contentId={demoContentId}
                currentContent={demoContent}
                onRestoreVersion={(content) => setDemoContent(content)}
              />
            </div>
          )}

          {activeDemo === 'media' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🖼️ Media Optimization Demo
              </h3>
              <MediaOptimization />
            </div>
          )}

          {activeDemo === 'security' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                🛡️ Security Audit Demo
              </h3>
              <SecurityAudit />
            </div>
          )}

          {activeDemo === 'performance' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                ⚡ Performance Monitor Demo
              </h3>
              <PerformanceMonitor />
            </div>
          )}

          {activeDemo === 'users' && (
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                👥 Advanced User Management Demo
              </h3>
              <AdvancedUserManagement />
            </div>
          )}
        </div>
      </Section>

      {/* Technical Specifications */}
      <Section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Technical Excellence
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Built with modern technologies for scalability, performance, and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🚀 Performance Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Real-time WebSocket connections for instant updates</li>
              <li>• Optimistic UI updates for responsive interactions</li>
              <li>• Intelligent caching with automatic invalidation</li>
              <li>• Lazy loading and code splitting for fast page loads</li>
              <li>• Progressive Web App with offline capabilities</li>
              <li>• Image optimization and WebP support</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🛡️ Security & Reliability</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Row Level Security (RLS) for data protection</li>
              <li>• Role-based access control with granular permissions</li>
              <li>• Audit logging for all user actions</li>
              <li>• Automated backups and disaster recovery</li>
              <li>• Content versioning and revision history</li>
              <li>• GDPR compliance and data privacy controls</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">🤖 AI & Machine Learning</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Content optimization suggestions with confidence scoring</li>
              <li>• Intelligent search with relevance ranking</li>
              <li>• Automated content categorization and tagging</li>
              <li>• Sentiment analysis for comments and feedback</li>
              <li>• Predictive analytics for content performance</li>
              <li>• Smart notification prioritization</li>
            </ul>
          </Card>

          <Card variant="premium">
            <h3 className="text-xl font-bold text-blue-900 mb-4">📈 Analytics & Insights</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Real-time user behavior tracking</li>
              <li>• Content engagement heatmaps</li>
              <li>• Conversion funnel analysis</li>
              <li>• A/B testing capabilities</li>
              <li>• Custom dashboard creation</li>
              <li>• Automated reporting and alerts</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Experience the Future of Content Management
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            BENIRAGE combines spiritual wisdom with cutting-edge technology to create 
            an unparalleled platform for community building and content management
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Schedule Demo
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AdvancedFeatures;