import React, { useState } from 'react';
import { Play, RotateCcw, Settings, BarChart3, Zap, Users, Eye } from 'lucide-react';
import EnhancedAdDisplay from '../components/ads/EnhancedAdDisplay';
import EnhancedAnnouncementDisplay from '../components/announcements/EnhancedAnnouncementDisplay';
import AdManagementDashboard from '../components/ads/AdManagementDashboard';
import AdCreationWizard from '../components/ads/AdCreationWizard';
import { Ad } from '../types/ads';
import { Announcement } from '../types/announcements';

type TabType = 'display' | 'announcements' | 'dashboard' | 'creator';

const AdSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('display');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'auto' | 'banner' | 'card' | 'video' | 'minimalist' | 'social'>('modern');
  const [autoRotate, setAutoRotate] = useState(true);

  // Mock data for demonstrations
  const mockAnnouncements: Announcement[] = [
    {
      id: 'demo-1',
      title: 'Welcome to Benirage Platform',
      message: 'Discover our spiritual, philosophical, and cultural programs. Join our community today!',
      type: 'info',
      position: 'top',
      priority: 'medium',
      isActive: true,
      startDate: new Date().toISOString(),
      targetAudience: 'all',
      dismissible: true,
      autoHide: true,
      autoHideDelay: 8,
      displayConditions: {
        devices: ['desktop', 'mobile', 'tablet']
      },
      actions: {
        primary: {
          label: 'Learn More',
          url: '/about'
        }
      },
      styling: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff',
        icon: 'Star'
      }
    },
    {
      id: 'demo-2',
      title: 'Philosophy Café Event',
      message: 'Join our weekly Philosophy Café every Saturday at 3 PM. Open discussion on life\'s big questions.',
      type: 'promotion',
      position: 'left',
      priority: 'high',
      isActive: true,
      startDate: new Date().toISOString(),
      targetAudience: 'all',
      dismissible: true,
      displayConditions: {
        pages: ['/', '/philosophy'],
        devices: ['desktop']
      },
      actions: {
        primary: {
          label: 'Register Now',
          url: '/philosophy-cafe-join'
        }
      },
      styling: {
        backgroundColor: '#f59e0b',
        textColor: '#ffffff',
        icon: 'Coffee'
      }
    }
  ];

  const handleAdCreate = (ad: Ad) => {
    console.log('Ad created:', ad);
    setActiveTab('dashboard');
  };

  const handleEditAd = (ad: Ad) => {
    console.log('Edit ad:', ad);
    setActiveTab('creator');
  };

  const handleViewAnalytics = (ad: Ad) => {
    console.log('View analytics for:', ad);
    setActiveTab('dashboard');
  };

  const renderDisplayDemo = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Professional Ad & Announcement System
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience our advanced advertising and announcement platform with stunning templates, 
          real-time analytics, A/B testing, and social media integration.
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Interactive Demo Controls</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedTemplate('modern')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4" />
              <span>Reset Demo</span>
            </button>
            
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                autoRotate
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Auto Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Ad Templates</h3>
            <div className="space-y-2">
              {[
                { name: 'Modern Hero', key: 'modern' as const },
                { name: 'Card Based', key: 'card' as const },
                { name: 'Video Ad', key: 'video' as const },
                { name: 'Minimalist', key: 'minimalist' as const },
                { name: 'Full Width', key: 'banner' as const },
                { name: 'Social Style', key: 'social' as const }
              ].map((template) => (
                <button
                  key={template.key}
                  className={`w-full text-left p-3 border border-gray-200 rounded-lg transition-colors ${
                    selectedTemplate === template.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'hover:border-blue-500 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.key)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Announcement Templates</h3>
            <div className="space-y-2">
              {[
                { name: 'Top Banner', key: 'banner' },
                { name: 'Card View', key: 'card' },
                { name: 'Floating Bar', key: 'floating' },
                { name: 'Sidebar Panel', key: 'sidebar' },
                { name: 'Compact', key: 'compact' }
              ].map((template) => (
                <button
                  key={template.key}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Features</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>A/B Testing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>Social Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Performance Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Ad Display */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Ad Display</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Desktop Template ({selectedTemplate})</h3>
            <EnhancedAdDisplay
              zoneSlug="hero-banner"
              template={selectedTemplate}
              enableAnimations={autoRotate}
              enableInteractions={true}
              className="w-full h-64"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Mobile Template (Card)</h3>
            <EnhancedAdDisplay
              zoneSlug="sidebar-ad"
              template="card"
              enableAnimations={true}
              enableInteractions={autoRotate}
              className="w-full h-64"
            />
          </div>
        </div>
      </div>

      {/* Live Announcements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Live Announcements</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Top Banner</h3>
            <EnhancedAnnouncementDisplay
              template="banner"
              position="top"
              enableAnimations={autoRotate}
              enableInteractions={true}
              autoHide={true}
              autoHideDelay={8}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Floating Action</h3>
              <div className="relative h-32">
                <EnhancedAnnouncementDisplay
                  template="floating"
                  position="floating"
                  enableAnimations={autoRotate}
                  enableInteractions={true}
                  className="absolute"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Compact Notification</h3>
              <EnhancedAnnouncementDisplay
                template="compact"
                position="top"
                enableAnimations={autoRotate}
                enableInteractions={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <AdManagementDashboard
      onCreateAd={() => setActiveTab('creator')}
      onEditAd={handleEditAd}
      onViewAnalytics={handleViewAnalytics}
    />
  );

  const renderCreator = () => (
    <AdCreationWizard
      onComplete={handleAdCreate}
      onCancel={() => setActiveTab('display')}
    />
  );

  const tabs = [
    { id: 'display', label: 'Display Demo', icon: Eye },
    { id: 'announcements', label: 'Announcements', icon: Users },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'creator', label: 'Ad Creator', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'display' && renderDisplayDemo()}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Announcement System</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Multi-Position Display</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Demo Announcements:</h3>
                    <div className="space-y-2">
                      {mockAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="p-3 border border-gray-100 rounded-lg">
                          <h4 className="font-medium text-sm text-gray-800">{announcement.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{announcement.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interactive Features</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Features Available:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Like and Share functionality</li>
                      <li>• Auto-hide with customizable delays</li>
                      <li>• Social media integration</li>
                      <li>• Multiple template styles</li>
                      <li>• Responsive design</li>
                      <li>• Analytics tracking</li>
                      <li>• Priority-based display</li>
                      <li>• Target audience filtering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'creator' && renderCreator()}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setActiveTab('creator')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdSystemDemo;