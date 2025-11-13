import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Users, Image, Settings, BarChart3, LogOut, Home, Shield, Key, UserCheck, MessageSquare, Zap, Mail, Search, Calendar, Database, Megaphone, BookOpen, Globe, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';
import { Permission } from '../../types/permissions';

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

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string | null;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const CMSLayout: React.FC<CMSLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string>('guest');
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);

  // Initialize permissions and role
  useEffect(() => {
    const initializePermissions = async () => {
      if (!currentUser) {
        setPermissions([]);
        setUserRole('guest');
        setIsLoadingPermissions(false);
        return;
      }

      setIsLoadingPermissions(true);
      setPermissionsError(null);

      try {
        // Get user profile
        const profile = await getCurrentUserProfile();

        if (!profile) {
          setPermissions([]);
          setUserRole('guest');
          setIsLoadingPermissions(false);
          return;
        }

        // Get user permissions using new RBAC system
        const userPermissions = await getUserAllPermissions(profile);
        setPermissions(userPermissions);

        // Determine role based on permissions hierarchy
        const roleHierarchy: Array<{ permission: Permission; role: string }> = [
          { permission: 'system.manage_permissions' as Permission, role: 'super-admin' },
          { permission: 'content.edit_all' as Permission, role: 'content-manager' },
          { permission: 'content.edit_own' as Permission, role: 'editor' },
          { permission: 'content.create_draft' as Permission, role: 'contributor' }
        ];

        const determinedRole = roleHierarchy.find(({ permission }) =>
          userPermissions.includes(permission)
        )?.role || 'viewer';

        setUserRole(determinedRole);
      } catch (error) {
        console.error('Error initializing permissions:', error);
        setPermissionsError('Failed to load permissions. Please refresh the page.');
        setPermissions([]);
        setUserRole('guest');
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    initializePermissions();
  }, [currentUser]);

  // Memoized helper function to check permissions with fallback
  const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (requiredPermissions.includes('*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm as Permission));
  }, [permissions]);

  // Memoized helper function to create navigation items with permission checks
  const createNavItems = useCallback((
    items: Array<{ id: string; name: string; icon: React.ComponentType<{ className?: string }>; permission?: string | null }>,
    requiredPermissions: string[]
  ): NavigationItem[] => {
    if (!hasPermission(requiredPermissions)) return [];
    return items.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      permission: item.permission
    }));
  }, [hasPermission]);

  // Memoized navigation sections for performance
  const navigationSections: NavigationSection[] = useMemo(() => [
    {
      title: 'Overview',
      items: createNavItems([
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3, permission: null }
      ], [])
    },
    {
      title: 'Content Management',
      items: [
        // Core content management features
        ...createNavItems([
          { id: 'content-list', name: 'All Content', icon: FileText, permission: null },
          { id: 'page-content', name: 'Page Content', icon: FileText, permission: null },
          { id: 'stories', name: 'Stories', icon: BookOpen, permission: null },
          { id: 'calendar', name: 'Content Calendar', icon: Calendar, permission: null }
        ], ['content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish', '*']),

        // Content organization
        ...createNavItems([
          { id: 'categories', name: 'Categories', icon: FileText, permission: null },
          { id: 'tags', name: 'Tags', icon: FileText, permission: null }
        ], ['system.edit_settings', 'content.create_draft', '*']),

        // Media management
        ...createNavItems([
          { id: 'media-library', name: 'Media Library', icon: Image, permission: null }
        ], ['media.edit_all', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'User & Community Management',
      items: [
        // User management
        ...createNavItems([
          { id: 'users', name: 'Users', icon: UserCheck, permission: null },
          { id: 'user-groups', name: 'User Groups', icon: Users, permission: null }
        ], ['users.manage_all', 'system.manage_users', '*']),

        // Form and application management
        ...createNavItems([
          { id: 'form-submissions', name: 'Applications', icon: Users, permission: null },
          { id: 'form-fields', name: 'Form Fields', icon: FileText, permission: null }
        ], ['membership.manage_applications', '*']),

        // Communication management
        ...createNavItems([
          { id: 'chat-admin', name: 'Chat Management', icon: MessageSquare, permission: null },
          { id: 'comments-admin', name: 'Comment Moderation', icon: MessageSquare, permission: null }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Marketing & SEO',
      items: [
        // Marketing tools
        ...createNavItems([
          { id: 'newsletter', name: 'Newsletter', icon: Mail, permission: null },
          { id: 'seo', name: 'SEO Management', icon: Search, permission: null },
          { id: 'ads', name: 'Advertisements', icon: Megaphone, permission: null }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        // Analytics and reporting
        ...createNavItems([
          { id: 'analytics', name: 'Analytics', icon: BarChart3, permission: null },
          { id: 'content-analytics', name: 'Content Analytics', icon: BarChart3, permission: 'analytics.view_basic' }
        ], ['analytics.view_basic', '*'])
      ]
    },
    {
      title: 'System Administration',
      items: [
        // Role & Permission Management
        ...createNavItems([
          { id: 'roles', name: 'Roles', icon: Shield, permission: null }
        ], ['system.manage_roles', '*']),
        ...createNavItems([
          { id: 'permissions', name: 'Permissions', icon: Key, permission: null }
        ], ['system.manage_permissions', '*']),

        // System settings
        ...createNavItems([
          { id: 'settings', name: 'Settings', icon: Settings, permission: null },
          { id: 'database', name: 'Database', icon: Database, permission: null }
        ], ['system.edit_settings', '*']),

        // Website management
        ...createNavItems([
          { id: 'website-manager', name: 'Website Manager', icon: Globe, permission: null }
        ], ['*', 'system.manage_permissions'])
      ]
    },
    {
      title: 'Advanced Features',
      items: [
        // Advanced tools
        ...createNavItems([
          { id: 'advanced-features', name: 'Advanced Tools', icon: Zap, permission: null },
          { id: 'ai-suggestions', name: 'AI Suggestions', icon: Zap, permission: 'content.edit_own' },
          { id: 'performance', name: 'Performance', icon: BarChart3, permission: null },
          { id: 'security-audit', name: 'Security Audit', icon: Shield, permission: null }
        ], ['system.edit_settings', 'analytics.view_basic', '*']),

        // Development tools
        ...createNavItems([
          { id: 'refactoring-info', name: 'System Info', icon: RefreshCw, permission: null },
          { id: 'content-guide', name: 'Content Guide', icon: FileText, permission: null },
          { id: 'deployment-guide', name: 'Deploy Guide', icon: Settings, permission: null }
        ], ['system.edit_settings', '*'])
      ]
    }
  ], [createNavItems]);

  // Loading state for permissions
  if (isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Error state for permissions
  if (permissionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission Error</h2>
          <p className="text-gray-600 mb-4">{permissionsError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img
                src="/LOGO_CLEAR_stars.png"
                alt="BENIRAGE"
                className="w-10 h-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-blue-900">BENIRAGE CMS</h1>
                <p className="text-sm text-gray-600 capitalize">{userRole.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{currentUser?.email || 'Unknown User'}</div>
                <div className="text-xs text-gray-500 capitalize">{userRole.replace('-', ' ')}</div>
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer">
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
            <div className="space-y-6">
              {navigationSections.map((section) => {
                const visibleItems = section.items.filter(item => !item.permission || permissions.includes(item.permission as Permission));

                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {visibleItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${currentPage === item.id
                            ? 'bg-blue-50 text-blue-900 font-medium shadow-sm border border-blue-100'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                            }`}
                        >
                          <div className={`p-1.5 rounded-md transition-colors duration-200 ${currentPage === item.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                            }`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content - improved spacing and max-width */}
        <div className="flex-1 p-8 lg:p-10 xl:p-12">
          <div className="max-w-7xl mx-auto">
            {children || (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to BENIRAGE CMS</h2>
                <p className="text-gray-600">Select an option from the sidebar to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSLayout;