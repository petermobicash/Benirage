import React, { useState, useEffect } from 'react';
import { FileText, Users, Image, Settings, BarChart3, LogOut, Home, Shield, Key, UserCheck, MessageSquare, Zap, Mail, Search, Calendar, Database, Megaphone, BookOpen } from 'lucide-react';
import Button from '../ui/Button';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface CMSLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const CMSLayout: React.FC<CMSLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('guest');

  // Initialize permissions and role
  useEffect(() => {
    const initializePermissions = async () => {
      if (currentUser) {
        try {
          // Get user profile
          const profile = await getCurrentUserProfile();

          // Get user permissions using new RBAC system
          if (profile) {
            const userPermissions = await getUserAllPermissions(profile);
            setPermissions(userPermissions);

            // For role, we'll use a simple mapping based on permissions
            // This is a simplified approach - in a real app you might want to store roles separately
            if (userPermissions.includes('system.manage_permissions')) {
              setUserRole('super-admin');
            } else if (userPermissions.includes('content.edit_all')) {
              setUserRole('content-manager');
            } else if (userPermissions.includes('content.edit_own')) {
              setUserRole('editor');
            } else if (userPermissions.includes('content.create_draft')) {
              setUserRole('contributor');
            } else {
              setUserRole('viewer');
            }
          } else {
            setPermissions([]);
            setUserRole('guest');
          }
        } catch (error) {
          console.error('Error initializing permissions:', error);
          setUserRole('guest');
        }
      }
    };

    initializePermissions();
  }, [currentUser]);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, permission: null },
    // Content Management - for content creators, reviewers, publishers
    ...((permissions.includes('content.create_draft') || permissions.includes('content.edit_own') || permissions.includes('content.edit_all') || permissions.includes('content.publish')) ? [
      { id: 'content-list', name: 'Content', icon: FileText, permission: null },
      { id: 'page-content', name: 'Page Content', icon: FileText, permission: null },
      { id: 'stories', name: 'Stories', icon: BookOpen, permission: null },
      { id: 'calendar', name: 'Calendar', icon: Calendar, permission: null }
    ] : []),

    // Form Management - for membership managers and admins
    ...(permissions.includes('membership.manage_applications') ? [
      { id: 'form-submissions', name: 'Applications', icon: Users, permission: null }
    ] : []),

    // Communications - for admins and content managers
    ...(permissions.includes('system.edit_settings') || permissions.includes('analytics.view_basic') || permissions.includes('content.create_draft') ? [
      { id: 'newsletter', name: 'Newsletter', icon: Mail, permission: null },
      { id: 'seo', name: 'SEO', icon: Search, permission: null },
      { id: 'chat-admin', name: 'Chat Management', icon: MessageSquare, permission: null }
    ] : []),

    // Media Library - for content creators and managers
    ...(permissions.includes('media.edit_all') || permissions.includes('content.create_draft') ? [
      { id: 'media-library', name: 'Media', icon: Image, permission: null }
    ] : []),

    // Advertisement Management - for admins and marketing managers
    ...(permissions.includes('system.edit_settings') || permissions.includes('analytics.view_basic') ? [
      { id: 'ads', name: 'Advertisements', icon: Megaphone, permission: null }
    ] : []),

    // User Management - only for admins and user managers
    ...((permissions.includes('users.manage_all') || permissions.includes('system.manage_users') || currentUser?.email === 'admin@benirage.org') ? [
      { id: 'users', name: 'Users', icon: UserCheck, permission: null },
      { id: 'user-groups', name: 'Groups', icon: Users, permission: null }
    ] : []),

    // Role & Permission Management - only for super admins
    ...(permissions.includes('system.manage_roles') ? [
      { id: 'roles', name: 'Roles', icon: Shield, permission: null }
    ] : []),
    ...(permissions.includes('system.manage_permissions') ? [
      { id: 'permissions', name: 'Permissions', icon: Key, permission: null }
    ] : []),

    // Analytics - for managers and admins
    ...(permissions.includes('analytics.view_basic') ? [
      { id: 'analytics', name: 'Analytics', icon: BarChart3, permission: null }
    ] : []),

    // Settings - only for admins
    ...(permissions.includes('system.edit_settings') ? [
      { id: 'settings', name: 'Settings', icon: Settings, permission: null },
      { id: 'database', name: 'Database', icon: Database, permission: null }
    ] : []),

    // Advanced Features - for admins and managers
    ...(permissions.includes('system.edit_settings') || permissions.includes('analytics.view_basic') ? [
      { id: 'advanced-features', name: 'Advanced', icon: Zap, permission: null },
      { id: 'ai-suggestions', name: 'AI Suggestions', icon: Zap, permission: 'content.edit_own' },
      { id: 'content-analytics', name: 'Content Analytics', icon: BarChart3, permission: 'analytics.view_basic' },
      { id: 'chat-demo', name: 'Chat Demo', icon: MessageSquare, permission: null },
      { id: 'system-test', name: 'System Test', icon: Settings, permission: null },
      { id: 'content-guide', name: 'Content Guide', icon: FileText, permission: null },
      { id: 'deployment-guide', name: 'Deploy Guide', icon: Settings, permission: null },
      { id: 'performance', name: 'Performance', icon: BarChart3, permission: null },
      { id: 'security-audit', name: 'Security', icon: Shield, permission: null }
    ] : [])
  ].filter(item => !item.permission || permissions.includes(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-blue-900">BENIRAGE CMS</h1>
                <p className="text-sm text-gray-600">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser?.email}</div>
                <div className="text-xs text-gray-500">{userRole}</div>
              </div>
              <a href="/" target="_blank">
                <Button variant="outline" size="sm" icon={Home}>
                  View Website
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={onLogout} icon={LogOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - responsive width for better usability */}
        <div className="xl:w-72 lg:w-64 md:w-56 sm:w-48 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <nav className="p-6">
            <div className="space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-900 font-semibold shadow-sm border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content - improved spacing and max-width */}
        <div className="flex-1 p-8 lg:p-10 xl:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSLayout;