import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Database } from '../../lib/supabase';
import { ensureUserProfile } from '../../utils/auth';
import LoginForm from './LoginForm';
import Card from '../ui/Card';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  onLogin: (user: User) => void;
  requiredRole?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  onLogin, 
  requiredRole,
  requiredPermission 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        // Ensure user profile exists and get it
        const profile = await ensureUserProfile(user);

        if (!profile) {
          setError('Unable to create or load user profile');
          setLoading(false);
          return;
        }

        const userWithProfile = { ...user, profile };

        // Check role requirements
        if (requiredRole && profile?.role !== requiredRole && !profile?.is_super_admin) {
          setError(`Access denied. Required role: ${requiredRole}`);
          setLoading(false);
          return;
        }

        // Check permission requirements
        if (requiredPermission && !checkUserPermission(profile, requiredPermission)) {
          setError(`Access denied. Required permission: ${requiredPermission}`);
          setLoading(false);
          return;
        }

        setUser(userWithProfile);
        onLogin(userWithProfile);
      } else {
        // No user found - clear any existing state
        setUser(null);
      }
    } catch (err) {
      // Handle anonymous users gracefully - don't log expected auth errors
      const error = err as Error & { status?: number };
      if (error.message?.includes('Auth session missing') ||
          error.name === 'AuthSessionMissingError' ||
          error.message?.includes('403') ||
          error.status === 403) {
        // This is expected for anonymous users - don't log as error
        console.log('Anonymous user detected - showing login options');
        setUser(null);
        setError(null);
      } else {
        console.error('Auth check error:', error);
        setError('Authentication check failed');
      }
    } finally {
      setLoading(false);
    }
  }, [requiredRole, requiredPermission, onLogin]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const checkUserPermission = (profile: Profile, permission: string): boolean => {
    if (!profile) return false;
    
    // Super admin has all permissions
    if (profile.is_super_admin) return true;
    
    // Check custom permissions
    if (profile.custom_permissions?.includes(permission) || profile.custom_permissions?.includes('*')) {
      return true;
    }
    
    // Basic role-based permissions
    const rolePermissions: Record<string, string[]> = {
      'super-admin': ['*'],
      'content-manager': ['content.*', 'media.*', 'forms.*'],
      'membership-manager': ['forms.membership', 'forms.volunteer', 'users.view'],
      'content-initiator': ['content.create', 'content.draft'],
      'content-reviewer': ['content.review', 'content.approve'],
      'content-publisher': ['content.publish'],
      'editor': ['content.edit', 'content.review'],
      'contributor': ['content.create']
    };
    
    const userPermissions = rolePermissions[profile.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <Card variant="premium" className="text-center">
          <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
          <p className="text-gray-600 mt-4">Checking authentication...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center px-4">
        <Card variant="premium" className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                checkAuth();
              }}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setError(null);
                setUser(null);
                setLoading(false);
              }}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={onLogin} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;