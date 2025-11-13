import { useState, useEffect, useCallback } from 'react';
import { Shield, MessageSquare } from 'lucide-react';
import { isAuthenticated, getCurrentAuthUser, logout } from '../utils/auth';
import { getCurrentUserProfile, getUserAllPermissions } from '../utils/rbac';
import { SYSTEM_PERMISSIONS, CONTENT_PERMISSIONS, USER_PERMISSIONS, MEDIA_PERMISSIONS, ANALYTICS_PERMISSIONS } from '../types/permissions';
import type { UserProfile } from '../types/permissions';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import FigmaCMSLayout from '../components/cms/FigmaCMSLayout';
import '../styles/figma-design-system.css';
import ContentList from '../components/cms/ContentList';
import ContentEditor from '../components/cms/ContentEditor';
import MediaLibrary from '../components/cms/MediaLibrary';
import PageContentManager from '../components/cms/PageContentManager';
import FormFieldManager from '../components/cms/FormFieldManager';
import ResourcesManager from '../components/cms/ResourcesManager';
import UserManager from '../components/cms/UserManager';
import UserGroupManager from '../components/cms/UserGroupManager';
import RoleManager from '../components/cms/RoleManager';
import PermissionManager from '../components/cms/PermissionManager';
import CategoryManager from '../components/cms/CategoryManager';
import TagManager from '../components/cms/TagManager';
import NewsletterManager from '../components/cms/NewsletterManager';
import SeoManager from '../components/cms/SeoManager';
import ContentCalendar from '../components/cms/ContentCalendar';
import CMSSettings from '../components/cms/CMSSettings';
import AdvancedAnalytics from '../components/cms/AdvancedAnalytics';
import FormSubmissionManager from '../components/cms/FormSubmissionManager';
import ContentGuide from './ContentGuide';
import DatabaseManager from '../components/cms/DatabaseManager';
import ChatManager from '../components/cms/ChatManager';
import AdManager from '../components/cms/AdManager';
import StoriesManager from '../components/cms/StoriesManager';
import MediaOptimization from '../components/advanced/MediaOptimization';
import SecurityAudit from '../components/advanced/SecurityAudit';
import PerformanceMonitor from '../components/advanced/PerformanceMonitor';
import AdvancedUserManagement from '../components/advanced/AdvancedUserManagement';
import AdvancedFeatures from './AdvancedFeatures';
import FigmaDashboard from '../components/cms/FigmaDashboard';
import AIContentSuggestions from '../components/advanced/AIContentSuggestions';
import ContentAnalytics from '../components/advanced/ContentAnalytics';
import RefactoringInfo from '../components/cms/RefactoringInfo';
import WebsiteManager from '../components/cms/WebsiteManager';

const CMS = () => {
  const [currentPage, setCurrentPage] = useState('');
  const [pageParams, setPageParams] = useState<{ type?: string; id?: string;[key: string]: unknown }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(getCurrentAuthUser());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Fetch user profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // DEVELOPMENT MODE: Grant all permissions to admin@benirage.org
      if (currentUser.email === 'admin@benirage.org') {
        console.log('🔓 Admin user detected - granting all permissions');
        // Set a mock super admin profile
        setUserProfile({
          id: currentUser.id,
          userId: currentUser.id,
          email: currentUser.email || 'admin@benirage.org',
          name: 'Super Administrator',
          role: 'super-admin' as UserProfile['role'],
          roles: ['super-admin' as UserProfile['role']],
          permissions: [],
          customPermissions: ['*'],
          isSuperAdmin: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as UserProfile);
      } else {
        getCurrentUserProfile().then(setUserProfile);
      }
    } else {
      setUserProfile(null);
    }
  }, [currentUser]);

  // Update permissions when userProfile changes
  useEffect(() => {
    if (userProfile) {
      // If super admin or has wildcard permission, grant all permissions
      if (userProfile.isSuperAdmin || userProfile.customPermissions?.includes('*')) {
        console.log('🔓 Super admin detected - granting all permissions');
        setPermissions(['*', 'users.view_all', 'users.create', 'users.edit_all', 'content.publish', 'system.edit_settings', 'analytics.view_advanced']);
      } else {
        setPermissions(getUserAllPermissions(userProfile));
      }
    } else {
      setPermissions([]);
    }
  }, [userProfile]);

  // Determine the best default page based on user permissions
  const getDefaultPage = useCallback(() => {
    // Default to dashboard for all authenticated users
    if (currentUser) {
      return 'dashboard';
    }
    return 'content-guide'; // fallback for users with limited permissions
  }, [currentUser]);

  // Set initial page based on permissions after login
  useEffect(() => {
    if (currentUser && !currentPage) {
      setCurrentPage(getDefaultPage());
    }
  }, [currentUser, permissions, currentPage, getDefaultPage]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // If not authenticated, show login form
  if (!isLoggedIn || !currentUser) {
    return (
      <ProtectedRoute onLogin={handleLogin}>
        <div />
      </ProtectedRoute>
    );
  }

  const handleNavigate = (page: string, params?: { type?: string; id?: string;[key: string]: unknown }) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  const renderCurrentPage = () => {
    switch (currentPage) {

      case 'dashboard':
        return <FigmaDashboard onNavigate={handleNavigate} />;

      case 'content-guide':
        return <ContentGuide />;

      case 'content-list':
        if (!permissions.includes('content.create_draft') && !permissions.includes('content.edit_own') && !permissions.includes('content.publish')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage content.</p>
            </div>
          );
        }
        return (
          <ContentList
            contentType={pageParams.type}
            onEdit={(id) => handleNavigate('content-editor', { id })}
            onCreateNew={() => handleNavigate('content-editor', { type: pageParams.type || 'post' })}
          />
        );

      case 'stories':
        if (!permissions.includes('content.create_draft') && !permissions.includes('content.edit_own') && !permissions.includes('content.publish')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage stories.</p>
            </div>
          );
        }
        return <StoriesManager />;

      case 'content-editor':
        if (!permissions.includes('content.create_draft') && !permissions.includes('content.edit_own')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to edit content.</p>
            </div>
          );
        }
        return (
          <ContentEditor
            contentId={pageParams.id}
            contentType={pageParams.type || 'post'}
            currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string;[key: string]: unknown }}
            onSave={() => handleNavigate('content-list', { type: pageParams.type })}
            onCancel={() => handleNavigate('content-list', { type: pageParams.type })}
          />
        );

      case 'media-library':
        if (!permissions.includes('media.edit_all') && !permissions.includes('content.create_draft')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access media library.</p>
            </div>
          );
        }
        return <MediaLibrary />;

      case 'page-content':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage page content.</p>
            </div>
          );
        }
        return <PageContentManager />;

      case 'form-fields':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage form fields.</p>
            </div>
          );
        }
        return <FormFieldManager />;

      case 'form-submissions':
        if (!(permissions.includes(USER_PERMISSIONS.USERS_CREATE) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to view form submissions.</p>
            </div>
          );
        }
        return <FormSubmissionManager currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string;[key: string]: unknown }} />;

      case 'resources-manager':
        if (!(permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED)) && !(permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage resources.</p>
            </div>
          );
        }
        return <ResourcesManager />;

      case 'users':
        if (!permissions.includes('users.view_all')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage users.</p>
            </div>
          );
        }
        return <UserManager currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string;[key: string]: unknown }} />;

      case 'user-groups':
        if (!(permissions.includes(USER_PERMISSIONS.USERS_VIEW_ALL) || permissions.includes(USER_PERMISSIONS.USERS_CREATE) || permissions.includes(USER_PERMISSIONS.USERS_EDIT_ALL))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage user groups.</p>
            </div>
          );
        }
        return <UserGroupManager />;

      case 'roles':
        if (!permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_MANAGE_ROLES)) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage roles.</p>
            </div>
          );
        }
        return <RoleManager />;

      case 'permissions':
        if (!permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_MANAGE_PERMISSIONS)) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage permissions.</p>
            </div>
          );
        }
        return <PermissionManager />;

      case 'categories':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage categories.</p>
            </div>
          );
        }
        return <CategoryManager />;

      case 'tags':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage tags.</p>
            </div>
          );
        }
        return <TagManager />;

      case 'newsletter':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && !(permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage newsletters.</p>
            </div>
          );
        }
        return <NewsletterManager />;

      case 'seo':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && !(permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage SEO.</p>
            </div>
          );
        }
        return <SeoManager />;

      case 'calendar':
        if (!(permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED)) && !(permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL)) && !permissions.includes(CONTENT_PERMISSIONS.CONTENT_PUBLISH)) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access the content calendar.</p>
            </div>
          );
        }
        return <ContentCalendar />;

      case 'analytics':
        if (!permissions.includes('analytics.view_basic')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to view analytics.</p>
            </div>
          );
        }
        return <AdvancedAnalytics />;

      case 'settings':
        if (!permissions.includes('system.edit_settings')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to manage settings.</p>
            </div>
          );
        }
        return <CMSSettings />;

      case 'database':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access database management.</p>
            </div>
          );
        }
        return <DatabaseManager />;

      case 'chat-admin':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && !(permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access chat administration.</p>
            </div>
          );
        }
        return <ChatManager />;

      case 'comments-admin':
        if (!(permissions.includes('system.edit_settings') || permissions.includes('analytics.view_basic') || permissions.includes('content.create_draft') || permissions.includes('*'))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access comment moderation.</p>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Comment Moderation</h2>
                <p className="text-gray-600">Manage and moderate user comments across all content</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Comment Management System</h3>
                <p className="text-gray-600 mb-6">
                  Monitor, approve, and moderate comments from users across all your content.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Pending Comments</h4>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-blue-700">Awaiting moderation</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Approved Comments</h4>
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-green-700">Live on website</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Flagged Comments</h4>
                    <p className="text-2xl font-bold text-red-600">0</p>
                    <p className="text-sm text-red-700">Require attention</p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    Comments are automatically enabled for all content. Users can comment on articles, stories, and other content.
                    <br />
                    Use this panel to moderate comments and ensure community guidelines are followed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ads':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && !(permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access advertisement management.</p>
            </div>
          );
        }
        return <AdManager />;

      case 'advanced-features':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && !(permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access advanced features.</p>
            </div>
          );
        }
        return <AdvancedFeatures />;

      case 'media-optimization':
        if (!(permissions.includes(MEDIA_PERMISSIONS.MEDIA_UPLOAD) || permissions.includes(MEDIA_PERMISSIONS.MEDIA_EDIT_ALL) || permissions.includes(MEDIA_PERMISSIONS.MEDIA_DELETE_ALL)) && !(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access media optimization.</p>
            </div>
          );
        }
        return <MediaOptimization />;

      case 'security-audit':
        if (!(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access security audit.</p>
            </div>
          );
        }
        return <SecurityAudit />;

      case 'performance':
        if (!(permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED)) && !(permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access performance monitoring.</p>
            </div>
          );
        }
        return <PerformanceMonitor />;

      case 'advanced-users':
        if (!permissions.includes('users.view_all')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access advanced user management.</p>
            </div>
          );
        }
        return <AdvancedUserManagement />;

      case 'ai-suggestions':
        if (!permissions.includes('content.edit_own')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access AI content suggestions.</p>
            </div>
          );
        }
        return (
          <AIContentSuggestions
            content="Sample content for AI suggestions"
            title="Sample Title"
            contentType="post"
            contentId="sample-content-id"
            onApplySuggestion={(suggestion) => console.log('Applied suggestion:', suggestion)}
          />
        );

      case 'content-analytics':
        if (!permissions.includes('analytics.view_basic')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to view content analytics.</p>
            </div>
          );
        }
        return <ContentAnalytics contentId="sample-content-id" />;

      case 'refactoring-info':
        if (!permissions.includes('system.view_settings')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to view refactoring information.</p>
            </div>
          );
        }
        return <RefactoringInfo />;

      case 'website-manager':
        if (!permissions.includes('*') && !permissions.includes('system.edit_settings')) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access website management. Super admin access required.</p>
            </div>
          );
        }
        return <WebsiteManager />;

      default:
        // Fallback for unknown routes - redirect to appropriate page based on permissions
        handleNavigate(getDefaultPage());
        return null;
    }
  };

  return (
    <FigmaCMSLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string;[key: string]: unknown }}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </FigmaCMSLayout>
  );
};

export default CMS;