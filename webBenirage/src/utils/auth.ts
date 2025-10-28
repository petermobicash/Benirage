import { supabase, signInWithEmail, signOut, getCurrentUser, refreshSession } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Types
type UserProfileInsert = {
  user_id: string;
  username: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

interface AuthError {
  message?: string;
  status?: number;
  code?: string;
}

// Authentication state management
let currentUser: User | null = null;

export const isAuthenticated = (): boolean => {
  return !!currentUser;
};

export const getCurrentAuthUser = () => {
  return currentUser;
};

export const login = async (email: string, password: string) => {
  try {
    const result = await signInWithEmail(email, password);
    if (result.success) {
      currentUser = result.user || null;
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
};

export const logout = async () => {
  try {
    await signOut();
    currentUser = null;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

// Initialize auth state
export const initializeAuth = async () => {
  try {
    console.log('Initializing auth...');
    let user = await getCurrentUser();

    // If no user but we have session data, try to refresh
    if (!user) {
      console.log('No user found, trying to refresh session...');
      const refreshResult = await refreshSession();

      if (refreshResult.success && refreshResult.user) {
        user = refreshResult.user;
        console.log('Session refreshed successfully');
      } else if (refreshResult.needsLogin) {
        // Expected for anonymous users - don't log as error
        console.log('User needs to login');
        currentUser = null;
        return null;
      }
    }

    currentUser = user;
    console.log('Auth initialized for user:', user?.id || 'none');
    return user;
  } catch (error: unknown) {
    // Handle anonymous users gracefully
    const authError = error as { message?: string; status?: number };
    if (authError?.message?.includes('Invalid Refresh Token') ||
        authError?.message?.includes('Refresh Token Not Found') ||
        authError?.message?.includes('Auth session missing') ||
        authError.status === 403) {
      // Expected for anonymous users - return null silently
      console.log('Anonymous user detected');
      currentUser = null;
      return null;
    }

    console.error('Error initializing auth:', error);
    return null;
  }
};

// Check if user exists in profiles table and create if needed
export const ensureUserProfile = async (user: User | null) => {
  if (!user) return null;

  try {
    // First, try to fetch existing profile with a simple query
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // If profile exists and no error, return it
    if (existingProfile && !selectError) {
      return existingProfile;
    }

    // If there's an RLS error on select, it might mean the profile doesn't exist or RLS is blocking
    if (selectError && selectError.code === '42501') {
      console.warn('RLS policy preventing profile check for user:', user.id);
    }

    // Try to create profile with upsert (safer than insert)
    console.log('Attempting to create/update profile for user:', user.id);

    // Start with minimal required fields
    const profileData: UserProfileInsert = {
      user_id: user.id,
      username: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to add optional fields that might not exist in the schema
    // We'll determine this by attempting the insert and handling errors

    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      // Handle schema cache errors for missing columns
      if (error.message?.includes("Could not find") && error.message?.includes("column") && error.message?.includes("schema cache")) {
        console.error('Schema cache error - missing columns in user_profiles table:', error.message);

        // Return a very minimal profile object that only includes guaranteed fields
        console.warn('Returning minimal profile object due to missing columns');
        return {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          error: 'SCHEMA_CACHE_ERROR'
        };
      }

      // Handle RLS policy violations more gracefully
      if (error.code === '42501') {
        console.error('RLS Policy Violation: Cannot create profile for user:', user.id);
        console.error('This typically means the RLS policies need to be updated.');

        // Try a simpler approach - just return a minimal profile object
        console.warn('Returning minimal profile object to allow app to continue');
        return {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          error: 'RLS_POLICY_VIOLATION'
        };
      }

      // Handle duplicate key errors (profile already exists)
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        console.log('Profile already exists, fetching existing profile...');
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProfile && !fetchError) {
          return existingProfile;
        }
      }

      // Handle infinite recursion errors
      if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
        console.error('Infinite recursion detected in RLS policy for profiles table');
        console.error('RLS policies have a circular reference and need to be fixed');

        // Return minimal profile to allow app to continue
        return {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'User',
          display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          error: 'RLS_POLICY_RECURSION'
        };
      }

      // Log the error for debugging but don't throw
      console.error('Unexpected error creating profile:', error);
      throw error;
    }

    console.log('Successfully created/updated profile for user:', user.id);
    return newProfile;

  } catch (error: unknown) {
    console.error('Error ensuring user profile:', error);

    // Provide graceful fallback for various issues
    const authError = error as AuthError;
    if (authError?.code === '42501' || authError?.message?.includes('row-level security policy')) {
      console.error('RLS Policy Violation - returning minimal profile object');
      return {
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        error: 'RLS_POLICY_VIOLATION'
      };
    }

    // Handle schema cache errors for missing columns
    if (authError?.message?.includes("Could not find") && authError?.message?.includes("column") && authError?.message?.includes("schema cache")) {
      console.error('Schema cache error - missing columns in user_profiles table:', authError.message);
      return {
        user_id: user.id,
        username: user.email?.split('@')[0] || 'User',
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        error: 'SCHEMA_CACHE_ERROR'
      };
    }

    // For any other errors, return null to indicate failure
    return null;
  }
};