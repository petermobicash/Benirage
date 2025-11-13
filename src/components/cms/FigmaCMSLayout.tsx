import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Users, Image, Settings, BarChart3, LogOut, Home, Shield, 
  Key, UserCheck, MessageSquare, Zap, Mail, Search, Calendar, 
  Database, Megaphone, BookOpen, Globe, RefreshCw, ChevronRight,
  Sparkles, Palette, Layers, Layout
} from 'lucide-react';
import Button from '../ui/Button';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';
import { Permission } from '../../types/permissions';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface FigmaCMSLayoutProps {
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
  description?: string;
}

interface NavigationSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

const FigmaCMSLayout: React.FC<FigmaCMSLayoutProps> = ({
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        const profile = await getCurrentUserProfile();
        if (!profile) {
          setPermissions([]);
          setUserRole('guest');
          setIsLoadingPermissions(false);
          return;
        }

        const userPermissions = await getUserAllPermissions(profile);
        setPermissions(userPermissions);

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

  const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (requiredPermissions.includes('*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm as Permission));
  }, [permissions]);

  const createNavItems = useCallback((
    items: Array<{ id: string; name: string; icon: React.ComponentType<{ className?: string }>; permission?: string | null; description?: string }>,
    requiredPermissions: string[]
  ): NavigationItem[] => {
    if (!hasPermission(requiredPermissions)) return [];
    return items.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      permission: item.permission,
      description: item.description
    }));
  }, [hasPermission]);

  const navigationSections: NavigationSection[] = useMemo(() => [
    {
      title: 'Overview',
      icon: Layout,
      items: createNavItems([
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3, description: 'Analytics and overview' }
      ], [])
    },
    {
      title: 'Content Studio',
      icon: Palette,
      items: [
        ...createNavItems([
          { id: 'content-list', name: 'All Content', icon: FileText, description: 'Manage your content' },
          { id: 'page-content', name: 'Page Content', icon: FileText, description: 'Static pages' },
          { id: 'stories', name: 'Stories', icon: BookOpen, description: 'Narrative content' },
          { id: 'calendar', name: 'Calendar', icon: Calendar, description: 'Content scheduling' }
        ], ['content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish', '*']),
        ...createNavItems([
          { id: 'categories', name: 'Categories', icon: Layers, description: 'Content organization' },
          { id: 'tags', name: 'Tags', icon: Search, description: 'Tag management' }
        ], ['system.edit_settings', 'content.create_draft', '*']),
        ...createNavItems([
          { id: 'media-library', name: 'Media Library', icon: Image, description: 'Asset management' }
        ], ['media.edit_all', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Community',
      icon: Users,
      items: [
        ...createNavItems([
          { id: 'users', name: 'Users', icon: UserCheck, description: 'User management' },
          { id: 'user-groups', name: 'Groups', icon: Users, description: 'User groups' }
        ], ['users.manage_all', 'system.manage_users', '*']),
        ...createNavItems([
          { id: 'form-submissions', name: 'Applications', icon: FileText, description: 'Membership applications' },
          { id: 'form-fields', name: 'Form Fields', icon: Settings, description: 'Form customization' }
        ], ['membership.manage_applications', '*']),
        ...createNavItems([
          { id: 'chat-admin', name: 'Chat', icon: MessageSquare, description: 'Chat management' },
          { id: 'comments-admin', name: 'Comments', icon: MessageSquare, description: 'Comment moderation' }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Growth',
      icon: Sparkles,
      items: [
        ...createNavItems([
          { id: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Email marketing' },
          { id: 'seo', name: 'SEO', icon: Search, description: 'Search optimization' },
          { id: 'ads', name: 'Advertisements', icon: Megaphone, description: 'Ad management' }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        ...createNavItems([
          { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Website analytics' },
          { id: 'content-analytics', name: 'Content Analytics', icon: BarChart3, description: 'Content performance' }
        ], ['analytics.view_basic', '*'])
      ]
    },
    {
      title: 'System',
      icon: Settings,
      items: [
        ...createNavItems([
          { id: 'roles', name: 'Roles', icon: Shield, description: 'Role management' }
        ], ['system.manage_roles', '*']),
        ...createNavItems([
          { id: 'permissions', name: 'Permissions', icon: Key, description: 'Permission control' }
        ], ['system.manage_permissions', '*']),
        ...createNavItems([
          { id: 'settings', name: 'Settings', icon: Settings, description: 'System settings' },
          { id: 'database', name: 'Database', icon: Database, description: 'Database management' }
        ], ['system.edit_settings', '*']),
        ...createNavItems([
          { id: 'website-manager', name: 'Website', icon: Globe, description: 'Website management' }
        ], ['*', 'system.manage_permissions'])
      ]
    },
    {
      title: 'Advanced',
      icon: Zap,
      items: [
        ...createNavItems([
          { id: 'advanced-features', name: 'Tools', icon: Zap, description: 'Advanced features' },
          { id: 'ai-suggestions', name: 'AI Suggestions', icon: Sparkles, description: 'AI-powered content' },
          { id: 'performance', name: 'Performance', icon: BarChart3, description: 'Performance monitoring' },
          { id: 'security-audit', name: 'Security', icon: Shield, description: 'Security audit' }
        ], ['system.edit_settings', 'analytics.view_basic', '*']),
        ...createNavItems([
          { id: 'refactoring-info', name: 'System Info', icon: RefreshCw, description: 'System information' },
          { id: 'content-guide', name: 'Guide', icon: BookOpen, description: 'Content guide' }
        ], ['system.edit_settings', '*'])
      ]
    }
  ], [createNavItems]);

  if (isLoadingPermissions) {
    return (
      <div className="figma-body flex items-center justify-center">
        <div className="figma-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="figma-body flex items-center justify-center">
        <div className="figma-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="figma-heading figma-heading-lg text-gray-900 mb-2">Permission Error</h2>
          <p className="text-gray-600 mb-6">{permissionsError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="figma-body">
      {/* Modern Header */}
      <header className="bg-brand-main-800/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-accent-400 rounded-xl flex items-center justify-center">
                  <span className="text-brand-main-800 font-bold text-lg">B</span>
                </div>
                <div>
                  <h1 className="figma-heading figma-heading-md text-white">BENIRAGE Studio</h1>
                  <p className="text-sm text-blue-200 capitalize">{userRole.replace('-', ' ')} workspace</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="figma-heading text-sm text-white">{currentUser?.email || 'Unknown User'}</div>
                <div className="text-xs text-blue-200 capitalize">{userRole.replace('-', ' ')}</div>
              </div>
              
              <a href="/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" icon={Home} className="figma-btn-secondary">
                  View Site
                </Button>
              </a>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout} 
                icon={LogOut}
                className="figma-btn-secondary"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="figma-container p-6">
        <div className="figma-main flex">
          {/* Modern Sidebar */}
          <aside className={`figma-sidebar transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-80'} figma-scrollbar overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                {!isSidebarCollapsed && (
                  <h2 className="figma-heading figma-heading-sm text-gray-700">Navigation</h2>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="figma-btn-secondary p-2"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
                </Button>
              </div>

              <div className="space-y-8">
                {navigationSections.map((section) => {
                  const visibleItems = section.items.filter(item => 
                    !item.permission || permissions.includes(item.permission as Permission)
                  );

                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={section.title} className="figma-fade-in">
                      {!isSidebarCollapsed && (
                        <div className="flex items-center space-x-2 mb-3">
                          <section.icon className="w-4 h-4 text-gray-400" />
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {section.title}
                          </h3>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`figma-nav-item w-full ${currentPage === item.id ? 'active' : ''} group`}
                            title={isSidebarCollapsed ? item.name : undefined}
                          >
                            <div className="flex-shrink-0">
                              <item.icon className="w-5 h-5" />
                            </div>
                            {!isSidebarCollapsed && (
                              <div className="ml-3 text-left flex-1">
                                <div className="figma-heading text-sm font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                )}
                              </div>
                            )}
                            {!isSidebarCollapsed && currentPage === item.id && (
                              <ChevronRight className="w-4 h-4 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 figma-scrollbar overflow-y-auto">
            <div className="p-8">
              {children || (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="figma-heading figma-heading-lg text-gray-900 mb-3">
                    Welcome to BENIRAGE Studio
                  </h2>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Your creative workspace for managing content, community, and growth. 
                    Choose a section from the sidebar to get started.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FigmaCMSLayout;