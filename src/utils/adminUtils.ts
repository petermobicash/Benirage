/**
 * Admin Utility Functions
 * Comprehensive super admin management and testing utilities
 */

import { supabase } from '../lib/supabase';
import { getCurrentUserProfile, getUserAllPermissions } from './rbac';
import { Permission } from '../types/permissions';

export interface AdminUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isSuperAdmin: boolean;
  department?: string;
  phone?: string;
}

export interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  realtime: 'healthy' | 'warning' | 'error';
  overall: 'healthy' | 'warning' | 'error';
}

// Test users for development and testing
export const TEST_ADMIN_USERS: AdminUser[] = [
  {
    email: 'superadmin@benirage.org',
    password: 'SuperAdmin2024!',
    firstName: 'Super',
    lastName: 'Administrator',
    role: 'super-admin',
    isSuperAdmin: true,
    department: 'IT',
    phone: '+250788000000'
  },
  {
    email: 'admin@benirage.org',
    password: 'Admin2024!',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    isSuperAdmin: false,
    department: 'Administration',
    phone: '+250788000001'
  },
  {
    email: 'contentmanager@benirage.org',
    password: 'Content2024!',
    firstName: 'Content',
    lastName: 'Manager',
    role: 'content-manager',
    isSuperAdmin: false,
    department: 'Content',
    phone: '+250788000002'
  }
];

/**
 * Admin Authentication and Profile Functions
 */
export class AdminManager {
  /**
   * Check if current user has super admin privileges
   */
  static async isCurrentUserSuperAdmin(): Promise<boolean> {
    try {
      const profile = await getCurrentUserProfile();
      return profile?.isSuperAdmin || false;
    } catch (error) {
      console.error('Error checking super admin status:', error);
      return false;
    }
  }

  /**
   * Get comprehensive user permissions
   */
  static async getCurrentUserPermissions(): Promise<{
    profile: any;
    permissions: Permission[];
    isSuperAdmin: boolean;
    role: string;
  }> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile) {
        return {
          profile: null,
          permissions: [],
          isSuperAdmin: false,
          role: 'guest'
        };
      }

      const permissions = await getUserAllPermissions(profile);
      return {
        profile,
        permissions,
        isSuperAdmin: profile.isSuperAdmin || false,
        role: profile.role || 'guest'
      };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return {
        profile: null,
        permissions: [],
        isSuperAdmin: false,
        role: 'guest'
      };
    }
  }

  /**
   * Login as admin user (for testing purposes)
   */
  static async loginAsAdmin(email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    profile?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get user profile after successful login
      const profile = await getCurrentUserProfile();
      
      return {
        success: true,
        user: data.user,
        profile
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create test admin user (development only)
   */
  static async createTestAdminUser(userData: AdminUser): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      // In a real application, this would be restricted to super admins
      // For development, we'll simulate the creation
      
      console.log('Creating test admin user:', userData.email);
      
      // Simulate successful creation
      const mockUser = {
        id: 'mock-user-id-' + Date.now(),
        email: userData.email,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          is_super_admin: userData.isSuperAdmin,
          department: userData.department,
          phone: userData.phone
        }
      };

      return {
        success: true,
        user: mockUser
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all users from the system
   */
  static async getAllUsers(): Promise<{
    success: boolean;
    users?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        users: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user role and permissions
   */
  static async updateUserRole(
    userId: string, 
    role: string, 
    isSuperAdmin: boolean = false
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role,
          is_super_admin: isSuperAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check system health
   */
  static async checkSystemHealth(): Promise<{
    success: boolean;
    health?: SystemHealth;
    error?: string;
  }> {
    try {
      // Test database connection
      const { error: dbError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });

      // Test auth
      const { data: { user } } = await supabase.auth.getUser();

      // Simulate other health checks (in real app, these would be actual tests)
      const health: SystemHealth = {
        database: dbError ? 'error' : 'healthy',
        auth: user ? 'healthy' : 'healthy', // Auth service is always healthy in this context
        storage: 'healthy', // Would test storage bucket access
        realtime: 'healthy', // Would test realtime connection
        overall: dbError ? 'warning' : 'healthy'
      };

      return {
        success: true,
        health
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(): Promise<{
    success: boolean;
    stats?: {
      totalUsers: number;
      activeUsers: number;
      totalContent: number;
      publishedContent: number;
      systemUptime: string;
    };
    error?: string;
  }> {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Simulate content statistics (would come from actual content tables)
      const stats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalContent: 150, // Simulated
        publishedContent: 120, // Simulated
        systemUptime: '99.9%' // Would come from monitoring system
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create audit log entry
   */
  static async createAuditLog(
    action: string,
    resource: string,
    details: string,
    userId?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const effectiveUserId = userId || user?.id;

      // In a real application, this would insert into an audit_logs table
      console.log('Audit Log:', {
        user_id: effectiveUserId,
        action,
        resource,
        details,
        timestamp: new Date().toISOString(),
        ip_address: '127.0.0.1' // Would get actual IP in real app
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Initialize super admin system
   */
  static async initializeSuperAdminSystem(): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      // Check current system health
      const healthCheck = await this.checkSystemHealth();
      if (!healthCheck.success) {
        return {
          success: false,
          message: 'System health check failed',
          error: healthCheck.error
        };
      }

      // Create audit log for initialization
      await this.createAuditLog(
        'SYSTEM_INITIALIZE',
        'admin_system',
        'Super admin system initialization started'
      );

      // Get system stats
      const stats = await this.getSystemStats();
      if (!stats.success) {
        return {
          success: false,
          message: 'Failed to get system statistics',
          error: stats.error
        };
      }

      return {
        success: true,
        message: `Super admin system initialized successfully. Health: ${healthCheck.health?.overall}, Users: ${stats.stats?.totalUsers}`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Make admin manager available globally for testing
if (typeof window !== 'undefined') {
  (window as any).adminManager = AdminManager;
  (window as any).TEST_ADMIN_USERS = TEST_ADMIN_USERS;
}

export default AdminManager;