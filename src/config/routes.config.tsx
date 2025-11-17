/**
 * Routes Configuration
 * Centralizes all route definitions for better maintainability
 * and easier route management across the application.
 */

import { lazy, Suspense, ReactElement, ComponentType } from 'react';
import { ROUTES } from './app.config';

// Lazy load all page components for optimal performance
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Spiritual = lazy(() => import('../pages/Spiritual'));
const Philosophy = lazy(() => import('../pages/Philosophy'));
const Culture = lazy(() => import('../pages/Culture'));
const Programs = lazy(() => import('../pages/Programs'));
const GetInvolved = lazy(() => import('../pages/GetInvolved'));
const Membership = lazy(() => import('../pages/Membership'));
const Volunteer = lazy(() => import('../pages/Volunteer'));
const Donate = lazy(() => import('../pages/Donate'));
const Partnership = lazy(() => import('../pages/Partnership'));
const Resources = lazy(() => import('../pages/Resources'));
const News = lazy(() => import('../pages/News'));
const Contact = lazy(() => import('../pages/Contact'));
const Admin = lazy(() => import('../pages/Admin'));
const CMS = lazy(() => import('../pages/CMS'));
const SystemTest = lazy(() => import('../pages/SystemTest'));
const ContentGuide = lazy(() => import('../pages/ContentGuide'));
const DeploymentGuide = lazy(() => import('../pages/DeploymentGuide'));
const ChatDemo = lazy(() => import('../pages/ChatDemo'));
const WhatsAppChatDemo = lazy(() => import('../pages/WhatsAppChatDemo'));
const AdvancedFeatures = lazy(() => import('../pages/AdvancedFeatures'));
const PublicChat = lazy(() => import('../pages/PublicChat'));
const Stories = lazy(() => import('../pages/Stories'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const Privacy = lazy(() => import('../pages/Privacy'));
const DynamicPage = lazy(() => import('../pages/DynamicPage'));

/**
 * Loading fallback component for lazy-loaded routes
 */
export const LoadingFallback = (): ReactElement => (
  <div className="flex items-center justify-center p-8">
    <div className="w-6 h-6 rounded-full animate-spin border-2 border-blue-600 border-t-transparent"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

/**
 * Wrapper component for lazy-loaded pages with Suspense
 */
const LazyRoute = ({ component: Component }: { component: React.LazyExoticComponent<ComponentType<any>> }): ReactElement => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  element: ReactElement;
  index?: boolean;
}

/**
 * Public routes configuration
 * These routes are accessible to all users without authentication
 */
export const publicRoutes: RouteConfig[] = [
  { path: ROUTES.HOME, element: <LazyRoute component={Home} />, index: true },
  { path: ROUTES.ABOUT, element: <LazyRoute component={About} /> },
  { path: ROUTES.SPIRITUAL, element: <LazyRoute component={Spiritual} /> },
  { path: ROUTES.PHILOSOPHY, element: <LazyRoute component={Philosophy} /> },
  { path: ROUTES.CULTURE, element: <LazyRoute component={Culture} /> },
  { path: ROUTES.PROGRAMS, element: <LazyRoute component={Programs} /> },
  { path: ROUTES.GET_INVOLVED, element: <LazyRoute component={GetInvolved} /> },
  { path: ROUTES.MEMBERSHIP, element: <LazyRoute component={Membership} /> },
  { path: ROUTES.VOLUNTEER, element: <LazyRoute component={Volunteer} /> },
  { path: ROUTES.DONATE, element: <LazyRoute component={Donate} /> },
  { path: ROUTES.PARTNERSHIP, element: <LazyRoute component={Partnership} /> },
  { path: ROUTES.RESOURCES, element: <LazyRoute component={Resources} /> },
  { path: ROUTES.NEWS, element: <LazyRoute component={News} /> },
  { path: ROUTES.CONTACT, element: <LazyRoute component={Contact} /> },
  { path: ROUTES.ADMIN, element: <LazyRoute component={Admin} /> },
  { path: ROUTES.ADMIN_LOGIN, element: <LazyRoute component={Admin} /> },
  { path: ROUTES.DYNAMIC_PAGE, element: <LazyRoute component={DynamicPage} /> },
  { path: ROUTES.SYSTEM_TEST, element: <LazyRoute component={SystemTest} /> },
  { path: ROUTES.CONTENT_GUIDE, element: <LazyRoute component={ContentGuide} /> },
  { path: ROUTES.DEPLOYMENT_GUIDE, element: <LazyRoute component={DeploymentGuide} /> },
  { path: ROUTES.CHAT_DEMO, element: <LazyRoute component={ChatDemo} /> },
  { path: ROUTES.WHATSAPP_CHAT_DEMO, element: <LazyRoute component={WhatsAppChatDemo} /> },
  { path: ROUTES.CHAT, element: <LazyRoute component={PublicChat} /> },
  { path: ROUTES.ADVANCED_FEATURES, element: <LazyRoute component={AdvancedFeatures} /> },
  { path: ROUTES.STORIES, element: <LazyRoute component={Stories} /> },
  { path: ROUTES.USER_MANAGEMENT, element: <LazyRoute component={UserManagement} /> },
  { path: ROUTES.PRIVACY, element: <LazyRoute component={Privacy} /> },
];

/**
 * CMS route configuration
 * Separate route for CMS without header/footer
 */
export const cmsRoute: RouteConfig = {
  path: ROUTES.CMS,
  element: <LazyRoute component={CMS} />,
};