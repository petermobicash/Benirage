import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { isAuthenticated, getCurrentAuthUser, logout } from '../utils/auth';
import { getCurrentUserProfile, getUserAllPermissions } from '../utils/rbac';
import { SYSTEM_PERMISSIONS, CONTENT_PERMISSIONS, USER_PERMISSIONS, MEDIA_PERMISSIONS, ANALYTICS_PERMISSIONS } from '../types/permissions';
import type { UserProfile } from '../types/permissions';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CMSLayout from '../components/cms/CMSLayout';
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
import EnhancedDashboard from '../components/admin/EnhancedDashboard';
import AIContentSuggestions from '../components/advanced/AIContentSuggestions';
import ContentAnalytics from '../components/advanced/ContentAnalytics';

const CMS = () => {
  const [currentPage, setCurrentPage] = useState('');
  const [pageParams, setPageParams] = useState<{ type?: string; id?: string; [key: string]: unknown }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [currentUser, setCurrentUser] = useState(getCurrentAuthUser());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Fetch user profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      getCurrentUserProfile().then(setUserProfile);
    } else {
      setUserProfile(null);
    }
  }, [currentUser]);

  // Update permissions when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setPermissions(getUserAllPermissions(userProfile));
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const handleNavigate = (page: string, params?: { type?: string; id?: string; [key: string]: unknown }) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  const renderCurrentPage = () => {
    switch (currentPage) {

      case 'dashboard':
        return <EnhancedDashboard onNavigate={handleNavigate} />;

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
            currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string; [key: string]: unknown }}
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(USER_PERMISSIONS.USERS_CREATE) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to view form submissions.</p>
            </div>
          );
        }
        return <FormSubmissionManager currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string; [key: string]: unknown }} />;
      
      case 'resources-manager':
        if (! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED)) && ! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL))) {
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
        return <UserManager currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string; [key: string]: unknown }} />;
      
      case 'user-groups':
        if (! (permissions.includes(USER_PERMISSIONS.USERS_VIEW_ALL) || permissions.includes(USER_PERMISSIONS.USERS_CREATE) || permissions.includes(USER_PERMISSIONS.USERS_EDIT_ALL))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
         if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && ! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED))) {
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
         if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && ! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED))) {
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
         if (! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED)) && ! (permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN) || permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL)) && !permissions.includes(CONTENT_PERMISSIONS.CONTENT_PUBLISH)) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && ! (permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
          return (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">You don't have permission to access chat administration.</p>
            </div>
          );
        }
        return <ChatManager />;

      case 'ads':
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && ! (permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS)) && ! (permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED))) {
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
        if (! (permissions.includes(MEDIA_PERMISSIONS.MEDIA_UPLOAD) || permissions.includes(MEDIA_PERMISSIONS.MEDIA_EDIT_ALL) || permissions.includes(MEDIA_PERMISSIONS.MEDIA_DELETE_ALL)) && ! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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
        if (! (permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) || permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED)) && ! (permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) || permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS))) {
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

      default:
        // Fallback for unknown routes - redirect to appropriate page based on permissions
        handleNavigate(getDefaultPage());
        return null;
    }
  };

  return (
    <CMSLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      currentUser={currentUser as { id: string; email: string; app_metadata: Record<string, unknown>; user_metadata: Record<string, unknown>; aud: string; created_at: string; [key: string]: unknown }}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </CMSLayout>
  );
};

export default CMS;