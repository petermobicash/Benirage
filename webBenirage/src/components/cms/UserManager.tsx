import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff, Shield, User, Users, Search, Filter, Download, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  getUserAllPermissionsThroughGroups,
  checkUserPermissionThroughGroups,
  getGroups,
  getUserGroups,
  assignUserToGroup,
  removeUserFromGroup
} from '../../utils/groupRBAC';
import {
  logUserCreation,
  logUserUpdate,
  logUserDeletion,
  logGroupAssignment,
  logBulkOperation
} from '../../utils/auditLogger';
import { auditLogger } from '../../utils/auditLogger';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { Group } from '../../types/groups';
import PermissionManager from '../admin/PermissionManager';
import UserOnboarding from '../onboarding/UserOnboarding';

interface UserData {
  id: string;
  user_id?: string | null;
  username: string;
  display_name: string;
  email?: string;
  role?: string;
  avatar?: string;
  avatar_url?: string;
  bio?: string;
  status?: string;
  custom_status?: string;
  last_seen?: string;
  is_online?: boolean;
  phone_number?: string;
  show_last_seen?: boolean;
  show_status?: boolean;
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  website?: string;
  social_links?: Record<string, string>;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  date_of_birth?: string;
  hire_date?: string;
  employee_id?: string;
  manager_id?: string;
  location?: string;
  timezone?: string;
  language_preference?: string;
  notification_preferences?: Record<string, boolean>;
  privacy_settings?: Record<string, boolean>;
  form_access_permissions?: string[];
  content_access_permissions?: string[];
  admin_access_permissions?: string[];
  workflow_permissions?: string[];
  approval_level?: number;
  access_level?: number;
  assigned_forms?: string[];
  assigned_categories?: string[];
  assigned_regions?: string[];
  groups?: string[];
  custom_permissions?: string[];
  last_login?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  is_super_admin?: boolean;
  profile_data?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  // Enhanced fields for unified management
  userGroups?: Array<{
    groupId: string;
    groupName: string;
    groupColor: string;
    assignedAt: string;
  }>;
  allPermissions?: string[];
  activityCount?: number;
  lastActivity?: string;
}

interface UserManagerProps {
  currentUser?: SupabaseUser | null;
}

interface ActivityData {
  action: string;
  resource: string;
  timestamp: string;
  details?: string;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [canManageUsers, setCanManageUsers] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Enhanced state for unified management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUserForGroups, setSelectedUserForGroups] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'contributor',
    avatar_url: '',
    department: '',
    position: '',
    phone: '',
    address: '',
    bio: '',
    website: '',
    social_links: {} as Record<string, string>,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    date_of_birth: '',
    hire_date: '',
    employee_id: '',
    manager_id: '',
    location: '',
    timezone: 'UTC',
    language_preference: 'en',
    notification_preferences: {} as Record<string, boolean>,
    privacy_settings: {} as Record<string, boolean>,
    form_access_permissions: [] as string[],
    content_access_permissions: [] as string[],
    admin_access_permissions: [] as string[],
    workflow_permissions: [] as string[],
    approval_level: 0,
    access_level: 1,
    assigned_forms: [] as string[],
    assigned_categories: [] as string[],
    assigned_regions: [] as string[],
    groups: [] as string[],
    custom_permissions: [] as string[],
    is_active: true,
    is_super_admin: false,
    // Enhanced fields for group-based RBAC integration
    selectedGroups: [] as string[], // Groups to assign during creation
    sendWelcomeEmail: true,
    requirePasswordChange: true
  });
  const { showToast } = useToast();


  // Initialize permissions and check access - must be before any conditional logic
  useEffect(() => {
    const initializePermissions = async () => {
      setIsInitializing(true);
      if (currentUser) {
        try {
          // Get user permissions using new groupRBAC system
          const userPermissions = await getUserAllPermissionsThroughGroups(currentUser.id);

          // Check if user can manage users - support both old and new permission systems
          let currentUserProfile = null;
          try {
            // Try to get user profile, but handle RLS issues gracefully
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', currentUser.id)
              .single();
            currentUserProfile = profile;
          } catch (error) {
            console.warn('Could not fetch user profile due to RLS policies:', error);
            // Continue without profile data - will rely on other permission checks
          }

          const canManage = await checkUserPermissionThroughGroups(currentUser.id, 'users.manage_all') ||
                          userPermissions.includes('users.manage_all') ||
                          userPermissions.includes('system.manage_users') ||
                          (currentUserProfile?.is_super_admin === true) ||
                          currentUser.email === 'admin@benirage.org' ||
                          // Fallback: if profile query failed but user has any admin permissions, allow access
                          (currentUserProfile === null && userPermissions.some(p => p.includes('manage') || p.includes('admin')));

          setCanManageUsers(canManage);
        } catch (error) {
          console.error('Error initializing permissions:', error);
          // Fallback for development - allow admin email
          if (currentUser.email === 'admin@benirage.org') {
            setCanManageUsers(true);
          }
        }
      } else {
        setCanManageUsers(false);
      }
      setIsInitializing(false);
    };

    initializePermissions();
  }, [currentUser]);


  // Fetch activity data when modal opens
  useEffect(() => {
    if (showActivityModal && !activityLoading) {
      const fetchActivityData = async () => {
        setActivityLoading(true);
        try {
          // Fetch user management related activities from the last 30 days
          const activityLogs = await auditLogger.getSystemActivity('user_management', 100, 24 * 30);
          setActivityData(activityLogs);
        } catch (error) {
          console.error('Error fetching activity data:', error);
          showToast('Failed to load activity data', 'error');
        } finally {
          setActivityLoading(false);
        }
      };

      fetchActivityData();
    }
  }, [showActivityModal, activityLoading, showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // First, let's check if we have admin access to view all profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Authentication required', 'error');
        return;
      }

      const query = supabase.from('user_profiles').select('*');
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Enhance user data with group information and permissions
      const enhancedUsers = await Promise.all((data || []).map(async (userData) => {
        try {
          // Get user's groups
          const userGroups = await getUserGroups(userData.user_id);

          // Get user's permissions through groups
          const userPermissions = await getUserAllPermissionsThroughGroups(userData.user_id);

          return {
            ...userData,
            userGroups,
            allPermissions: userPermissions,
            activityCount: 0, // TODO: Implement activity tracking
            lastActivity: userData.last_login || userData.created_at
          };
        } catch (error) {
          console.error(`Error enhancing user ${userData.id}:`, error);
          return {
            ...userData,
            userGroups: [],
            allPermissions: [],
            activityCount: 0,
            lastActivity: userData.last_login || userData.created_at
          };
        }
      }));

      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to load users: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchGroups = useCallback(async () => {
    try {
      const groupsData = await getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      showToast('Failed to load groups', 'error');
    }
  }, [showToast]);

  // Fetch users and groups data - must be after permission initialization
  useEffect(() => {
    if (!isInitializing && canManageUsers) {
      fetchUsers();
      fetchGroups();
    } else if (!isInitializing && !canManageUsers) {
      setUsers([]);
      setGroups([]);
    }
  }, [isInitializing, canManageUsers, fetchUsers, fetchGroups]);

  const roles = [
    { value: 'super-admin', label: 'Super Admin' },
    { value: 'content-manager', label: 'Content Manager' },
    { value: 'editor', label: 'Editor' },
    { value: 'contributor', label: 'Contributor' },
    { value: 'viewer', label: 'Viewer' }
  ];

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Initializing...</span>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage users - only after hooks are initialized
  if (!canManageUsers) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to manage users.
        </p>
        <p className="text-sm text-gray-400">
          Contact admin@benirage.org for access.
        </p>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      if (editingId) {
        // Get the user_id from the existing profile first
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('id', editingId)
          .single();

        if (!existingProfile) {
          throw new Error('Profile not found');
        }

        const { error } = await supabase
          .from('user_profiles')
          .update({
            display_name: formData.name,
            department: formData.department,
            position: formData.position,
            phone: formData.phone,
            address: formData.address,
            bio: formData.bio,
            website: formData.website,
            social_links: formData.social_links,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            date_of_birth: formData.date_of_birth,
            hire_date: formData.hire_date,
            employee_id: formData.employee_id,
            manager_id: formData.manager_id,
            location: formData.location,
            timezone: formData.timezone,
            language_preference: formData.language_preference,
            notification_preferences: formData.notification_preferences,
            privacy_settings: formData.privacy_settings,
            form_access_permissions: formData.form_access_permissions,
            content_access_permissions: formData.content_access_permissions,
            admin_access_permissions: formData.admin_access_permissions,
            workflow_permissions: formData.workflow_permissions,
            approval_level: formData.approval_level,
            access_level: formData.access_level,
            assigned_forms: formData.assigned_forms,
            assigned_categories: formData.assigned_categories,
            assigned_regions: formData.assigned_regions,
            role: formData.role,
            avatar_url: formData.avatar_url,
            groups: formData.groups,
            custom_permissions: formData.custom_permissions,
            is_active: formData.is_active,
            is_super_admin: formData.is_super_admin
          })
          .eq('user_id', existingProfile.user_id);

        if (error) throw error;

        // Log user update with changes made
        const changes: Record<string, unknown> = {};
        const originalUser = users.find(u => u.id === editingId);

        if (originalUser) {
          // Track what fields changed
          if (originalUser.display_name !== formData.name) changes.display_name = { from: originalUser.display_name, to: formData.name };
          if (originalUser.department !== formData.department) changes.department = { from: originalUser.department, to: formData.department };
          if (originalUser.position !== formData.position) changes.position = { from: originalUser.position, to: formData.position };
          if (originalUser.phone !== formData.phone) changes.phone = { from: originalUser.phone, to: formData.phone };
          if (originalUser.address !== formData.address) changes.address = { from: originalUser.address, to: formData.address };
          if (originalUser.bio !== formData.bio) changes.bio = { from: originalUser.bio, to: formData.bio };
          if (originalUser.website !== formData.website) changes.website = { from: originalUser.website, to: formData.website };
          if (originalUser.role !== formData.role) changes.role = { from: originalUser.role, to: formData.role };
          if (originalUser.is_active !== formData.is_active) changes.is_active = { from: originalUser.is_active, to: formData.is_active };
          if (originalUser.is_super_admin !== formData.is_super_admin) changes.is_super_admin = { from: originalUser.is_super_admin, to: formData.is_super_admin };

          // Track group changes
          const originalGroupIds = originalUser.userGroups?.map(g => g.groupId) || [];
          const newGroupIds = formData.selectedGroups;
          if (JSON.stringify(originalGroupIds.sort()) !== JSON.stringify(newGroupIds.sort())) {
            changes.groups = { from: originalGroupIds, to: newGroupIds };
          }

          // Only log if there were actual changes
          if (Object.keys(changes).length > 0) {
            await logUserUpdate(
              currentUser?.id || 'system',
              existingProfile.user_id,
              changes
            );
          }
        }

        // Update group assignments if they changed
        if (formData.selectedGroups.length > 0) {
          try {
            // Get current user groups
            const currentUserGroups = await getUserGroups(existingProfile.user_id);
            const currentGroupIds = currentUserGroups.map(ug => ug.groupId);

            // Remove user from groups they're no longer in
            const groupsToRemove = currentGroupIds.filter(id => !formData.selectedGroups.includes(id));
            await Promise.all(
              groupsToRemove.map(groupId => removeUserFromGroup(groupId, existingProfile.user_id))
            );

            // Add user to new groups
            const groupsToAdd = formData.selectedGroups.filter(id => !currentGroupIds.includes(id));
            await Promise.all(
              groupsToAdd.map(groupId => assignUserToGroup({
                groupId,
                userId: existingProfile.user_id,
                assignedBy: currentUser?.id || 'system'
              }))
            );

            if (groupsToAdd.length > 0 || groupsToRemove.length > 0) {
              showToast(`User updated successfully and group assignments updated`, 'success');
            } else {
              showToast('User updated successfully', 'success');
            }
          } catch (groupError) {
            console.error('Error updating user groups:', groupError);
            showToast('User updated but failed to update some group assignments', 'warning');
          }
        } else {
          showToast('User updated successfully', 'success');
        }
      } else {
        // Enhanced user creation with better error handling
        try {
          const { data: { user: currentAuthUser } } = await supabase.auth.getUser();

          if (!currentAuthUser) {
            showToast('Authentication required. Please log in first.', 'error');
            return;
          }

          // Check if current user is admin by checking their profile
          const { data: currentUserProfile } = await supabase
            .from('user_profiles')
            .select('username, is_super_admin')
            .eq('user_id', currentAuthUser.id)
            .single();

          const isAdmin = currentUserProfile?.username === 'admin' ||
                         currentUserProfile?.is_super_admin === true ||
                         currentAuthUser.email === 'admin@benirage.org';

          if (isAdmin) {
            try {
              // Admin can create users via admin API
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: formData.email,
                password: 'temp123',
                email_confirm: true,
                user_metadata: {
                  display_name: formData.name,
                  role: formData.role
                }
              });

              if (authError) {
                console.error('Admin API error:', authError);
                throw new Error(`Admin API error: ${authError.message}`);
              }

              if (!authData.user) {
                throw new Error('Failed to create user - no user data returned');
              }

              // Create or update the profile with additional data
              const { error } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: authData.user.id,
                  username: formData.email.split('@')[0],
                  display_name: formData.name,
                  department: formData.department,
                  position: formData.position,
                  phone: formData.phone,
                  address: formData.address,
                  bio: formData.bio,
                  website: formData.website,
                  social_links: formData.social_links,
                  emergency_contact_name: formData.emergency_contact_name,
                  emergency_contact_phone: formData.emergency_contact_phone,
                  date_of_birth: formData.date_of_birth,
                  hire_date: formData.hire_date,
                  employee_id: formData.employee_id,
                  manager_id: formData.manager_id,
                  location: formData.location,
                  timezone: formData.timezone,
                  language_preference: formData.language_preference,
                  notification_preferences: formData.notification_preferences,
                  privacy_settings: formData.privacy_settings,
                  form_access_permissions: formData.form_access_permissions,
                  content_access_permissions: formData.content_access_permissions,
                  admin_access_permissions: formData.admin_access_permissions,
                  workflow_permissions: formData.workflow_permissions,
                  approval_level: formData.approval_level,
                  access_level: formData.access_level,
                  assigned_forms: formData.assigned_forms,
                  assigned_categories: formData.assigned_categories,
                  assigned_regions: formData.assigned_regions,
                  role: formData.role,
                  avatar_url: formData.avatar_url,
                  groups: formData.groups,
                  custom_permissions: formData.custom_permissions,
                  is_active: formData.is_active,
                  is_super_admin: formData.is_super_admin,
                  status: 'active',
                  is_online: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_id'
                });

              if (error) {
                console.error('Profile creation error:', error);
                throw new Error(`Profile creation error: ${error.message}`);
              }

              // Log user creation
              await logUserCreation(
                currentUser?.id || 'system',
                authData.user.id,
                formData.email,
                formData.selectedGroups
              );

              // Assign user to selected groups
              if (formData.selectedGroups.length > 0) {
                try {
                  const groupAssignments = formData.selectedGroups.map(groupId => ({
                    groupId,
                    userId: authData.user.id,
                    assignedBy: currentUser?.id || 'system'
                  }));

                  await Promise.all(
                    groupAssignments.map(async (assignment) => {
                      await assignUserToGroup(assignment);
                      // Log each group assignment
                      const group = groups.find(g => g.id === assignment.groupId);
                      if (group) {
                        await logGroupAssignment(
                          currentUser?.id || 'system',
                          authData.user.id,
                          assignment.groupId,
                          group.name,
                          'assigned'
                        );
                      }
                    })
                  );

                  showToast(`✅ User created successfully and assigned to ${formData.selectedGroups.length} group(s)`, 'success');

                  // Trigger onboarding for new user
                  setNewUserId(authData.user.id);
                  setNewUserEmail(formData.email);
                  setShowOnboarding(true);
                } catch (groupError) {
                  console.error('Error assigning user to groups:', groupError);
                  showToast('⚠️ User created but failed to assign to some groups', 'warning');
                }
              } else {
                showToast('✅ User created successfully with temporary password: temp123', 'success');

                // Trigger onboarding for new user
                setNewUserId(authData.user.id);
                setNewUserEmail(formData.email);
                setShowOnboarding(true);
              }
            } catch (adminError: unknown) {
              console.error('Admin user creation failed:', adminError);

              // Fallback: try to create profile for invite-based system
              const errorMessage = adminError instanceof Error ? adminError.message : String(adminError);
              if (errorMessage.includes('admin') || errorMessage.includes('permission')) {
                showToast('🔄 Admin API not available, creating invitation instead...', 'info');

                const { error } = await supabase
                  .from('user_profiles')
                  .insert({
                    user_id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    username: formData.email.split('@')[0],
                    display_name: formData.name,
                    email: formData.email,
                    department: formData.department,
                    position: formData.position,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    website: formData.website,
                    social_links: formData.social_links,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    date_of_birth: formData.date_of_birth,
                    hire_date: formData.hire_date,
                    employee_id: formData.employee_id,
                    manager_id: formData.manager_id,
                    location: formData.location,
                    timezone: formData.timezone,
                    language_preference: formData.language_preference,
                    notification_preferences: formData.notification_preferences,
                    privacy_settings: formData.privacy_settings,
                    form_access_permissions: formData.form_access_permissions,
                    content_access_permissions: formData.content_access_permissions,
                    admin_access_permissions: formData.admin_access_permissions,
                    workflow_permissions: formData.workflow_permissions,
                    approval_level: formData.approval_level,
                    access_level: formData.access_level,
                    assigned_forms: formData.assigned_forms,
                    assigned_categories: formData.assigned_categories,
                    assigned_regions: formData.assigned_regions,
                    role: formData.role,
                    avatar_url: formData.avatar_url,
                    groups: formData.groups,
                    custom_permissions: formData.custom_permissions,
                    is_active: formData.is_active,
                    is_super_admin: formData.is_super_admin,
                    status: 'pending',
                    is_online: false,
                    profile_completed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (error) throw error;

                showToast('✅ User invitation created! User will need to sign up with this email to activate their account.', 'success');
              } else {
                throw adminError;
              }
            }
          } else {
            // For non-admin users, create an invitation that will be activated when user signs up
            showToast('🔄 Creating user invitation (non-admin mode)...', 'info');

            const { error } = await supabase
              .from('user_profiles')
              .insert({
                user_id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                username: formData.email.split('@')[0],
                display_name: formData.name,
                email: formData.email,
                department: formData.department,
                position: formData.position,
                phone: formData.phone,
                address: formData.address,
                bio: formData.bio,
                website: formData.website,
                social_links: formData.social_links,
                emergency_contact_name: formData.emergency_contact_name,
                emergency_contact_phone: formData.emergency_contact_phone,
                date_of_birth: formData.date_of_birth,
                hire_date: formData.hire_date,
                employee_id: formData.employee_id,
                manager_id: formData.manager_id,
                location: formData.location,
                timezone: formData.timezone,
                language_preference: formData.language_preference,
                notification_preferences: formData.notification_preferences,
                privacy_settings: formData.privacy_settings,
                form_access_permissions: formData.form_access_permissions,
                content_access_permissions: formData.content_access_permissions,
                admin_access_permissions: formData.admin_access_permissions,
                workflow_permissions: formData.workflow_permissions,
                approval_level: formData.approval_level,
                access_level: formData.access_level,
                assigned_forms: formData.assigned_forms,
                assigned_categories: formData.assigned_categories,
                assigned_regions: formData.assigned_regions,
                role: formData.role,
                avatar_url: formData.avatar_url,
                groups: formData.groups,
                custom_permissions: formData.custom_permissions,
                is_active: formData.is_active,
                is_super_admin: formData.is_super_admin,
                status: 'pending',
                is_online: false,
                profile_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (error) {
              console.error('Invitation creation error:', error);
              throw new Error(`Failed to create user invitation: ${error.message}`);
            }

            showToast('✅ User invitation created! The user will need to sign up with this email address to activate their account.', 'success');
          }
        } catch (error: unknown) {
          console.error('Error in user creation process:', error);

          // Provide specific error messages based on the error type
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('admin') || errorMessage.includes('permission')) {
            showToast('❌ Admin privileges required. Please log in as admin@benirage.org or contact your administrator.', 'error');
          } else if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
            showToast('❌ Database policy error. Please run the RLS fix script in Supabase SQL Editor.', 'error');
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            showToast('❌ Network error. Please check your connection and try again.', 'error');
          } else {
            showToast(`❌ Failed to create user: ${errorMessage}`, 'error');
          }
        }
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to save user: ${errorMessage}`, 'error');
    }
  };

  const handleEdit = (user: UserData) => {
    setFormData({
      name: user.display_name || '',
      email: user.username || '', // Username field for display purposes
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      website: user.website || '',
      social_links: user.social_links || {},
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || '',
      date_of_birth: user.date_of_birth || '',
      hire_date: user.hire_date || '',
      employee_id: user.employee_id || '',
      manager_id: user.manager_id || '',
      location: user.location || '',
      timezone: user.timezone || 'UTC',
      language_preference: user.language_preference || 'en',
      notification_preferences: user.notification_preferences || {},
      privacy_settings: user.privacy_settings || {},
      form_access_permissions: user.form_access_permissions || [],
      content_access_permissions: user.content_access_permissions || [],
      admin_access_permissions: user.admin_access_permissions || [],
      workflow_permissions: user.workflow_permissions || [],
      approval_level: user.approval_level || 0,
      access_level: user.access_level || 1,
      assigned_forms: user.assigned_forms || [],
      assigned_categories: user.assigned_categories || [],
      assigned_regions: user.assigned_regions || [],
      role: user.role || 'contributor',
      avatar_url: user.avatar_url || '',
      groups: user.groups || [],
      custom_permissions: user.custom_permissions || [],
      is_active: user.is_active,
      is_super_admin: user.is_super_admin || false,
      selectedGroups: user.userGroups?.map(g => g.groupId) || [],
      sendWelcomeEmail: true,
      requirePasswordChange: false
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // Find the user data first
      const userToDelete = users.find(u => u.id === id);
      if (!userToDelete) {
        throw new Error('User not found');
      }

      // Get the user_id first
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', profile.user_id);

      if (error) throw error;

      // Log user deletion
      await logUserDeletion(
        currentUser?.id || 'system',
        profile.user_id,
        userToDelete.username || 'unknown'
      );

      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to delete user: ${errorMessage}`, 'error');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      // Get the user_id first
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !isActive })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      // Log user status change
      await logUserUpdate(
        currentUser?.id || 'system',
        profile.user_id,
        {
          is_active: { from: isActive, to: !isActive }
        }
      );

      showToast(`User ${!isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast(`Failed to update user status: ${errorMessage}`, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      phone: '',
      address: '',
      bio: '',
      website: '',
      social_links: {},
      emergency_contact_name: '',
      emergency_contact_phone: '',
      date_of_birth: '',
      hire_date: '',
      employee_id: '',
      manager_id: '',
      location: '',
      timezone: 'UTC',
      language_preference: 'en',
      notification_preferences: {},
      privacy_settings: {},
      form_access_permissions: [],
      content_access_permissions: [],
      admin_access_permissions: [],
      workflow_permissions: [],
      approval_level: 0,
      access_level: 1,
      assigned_forms: [],
      assigned_categories: [],
      assigned_regions: [],
      role: 'contributor',
      avatar_url: '',
      groups: [],
      custom_permissions: [],
      is_active: true,
      is_super_admin: false,
      selectedGroups: [],
      sendWelcomeEmail: true,
      requirePasswordChange: true
    });
    setEditingId(null);
  };

  const handleArrayFieldChange = (field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData({ ...formData, [field]: array });
  };

  // Enhanced filtering and search functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const matchesGroup = groupFilter === 'all' ||
      user.userGroups?.some(ug => ug.groupId === groupFilter);

    return matchesSearch && matchesStatus && matchesRole && matchesGroup;
  });

  // Bulk operations
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(user => user.id)
    );
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedUsers.length === 0) return;

    try {
      const promises = selectedUsers.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Get the auth user ID from the profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('id', user.id)
          .single();

        if (profile?.user_id) {
          return supabase
            .from('user_profiles')
            .update({ is_active: isActive })
            .eq('user_id', profile.user_id);
        }
      });

      await Promise.all(promises);

      // Log bulk status change
      await logBulkOperation(
        currentUser?.id || 'system',
        'status_change',
        selectedUsers,
        { newStatus: isActive, count: selectedUsers.length }
      );

      showToast(`Updated ${selectedUsers.length} users`, 'success');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk updating users:', error);
      showToast('Failed to update users', 'error');
    }
  };

  const handleBulkGroupAssignment = async (groupId: string) => {
    if (selectedUsers.length === 0 || !groupId) return;

    try {
      const promises = selectedUsers.map(async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Find the auth user ID from the profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('id', user.id)
          .single();

        if (profile?.user_id) {
          return assignUserToGroup({
            groupId,
            userId: profile.user_id,
            assignedBy: currentUser?.id || 'system'
          });
        }
      });

      await Promise.all(promises);

      // Log bulk group assignment
      await logBulkOperation(
        currentUser?.id || 'system',
        'group_assignment',
        selectedUsers,
        { groupId, groupName: groups.find(g => g.id === groupId)?.name, count: selectedUsers.length }
      );

      showToast(`Added ${selectedUsers.length} users to group`, 'success');
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk assigning users to group:', error);
      showToast('Failed to assign users to group', 'error');
    }
  };

  // Export functionality
  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      const dataToExport = filteredUsers.map(user => ({
        name: user.display_name,
        username: user.username,
        role: user.role,
        department: user.department,
        position: user.position,
        is_active: user.is_active,
        groups: user.userGroups?.map(g => g.groupName).join(', ') || '',
        permissions: user.allPermissions?.join(', ') || '',
        created_at: user.created_at,
        last_login: user.last_login
      }));

      const csvContent = [
        Object.keys(dataToExport[0] || {}).join(','),
        ...dataToExport.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast('Users exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('Failed to export users', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Group management for users
  const handleManageUserGroups = (userId: string) => {
    setSelectedUserForGroups(userId);
    setShowGroupModal(true);
  };

  const handleUserGroupAssignment = async (groupId: string, assign: boolean) => {
    if (!selectedUserForGroups) return;

    try {
      const user = users.find(u => u.id === selectedUserForGroups);
      if (!user) return;

      // Get the auth user ID from the profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('id', user.id)
        .single();

      if (!profile?.user_id) return;

      if (assign) {
        await assignUserToGroup({
          groupId,
          userId: profile.user_id,
          assignedBy: currentUser?.id || 'system'
        });

        // Log group assignment
        await logGroupAssignment(
          currentUser?.id || 'system',
          profile.user_id,
          groupId,
          groups.find(g => g.id === groupId)?.name || 'Unknown',
          'assigned'
        );
      } else {
        await removeUserFromGroup(groupId, profile.user_id);

        // Log group removal
        await logGroupAssignment(
          currentUser?.id || 'system',
          profile.user_id,
          groupId,
          groups.find(g => g.id === groupId)?.name || 'Unknown',
          'removed'
        );
      }

      showToast(`User ${assign ? 'added to' : 'removed from'} group`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error managing user groups:', error);
      showToast('Failed to update user groups', 'error');
    }
  };


  if (loading && !isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'users'
              ? `Manage users, groups, and permissions (${filteredUsers.length} users)`
              : 'Manage groups, permissions, and access control'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkActions(!showBulkActions)}
              >
                Bulk Actions
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActivityModal(true)}
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Log
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUsers}
            disabled={exportLoading}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Permission Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Search and Filters */}
          <Card className={`${showFilters ? 'block' : 'hidden'}`}>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="super-admin">Super Admin</option>
                <option value="content-manager">Content Manager</option>
                <option value="editor">Editor</option>
                <option value="contributor">Contributor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && selectedUsers.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Bulk Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleBulkStatusChange(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Activate Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusChange(false)}
                className="text-red-600 hover:text-red-700"
              >
                Deactivate Selected
              </Button>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkGroupAssignment(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Assign to Group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New User' : 'Edit User'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: String(value) })}
                required
              />

              <FormField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: String(value) })}
                required
                disabled={editingId !== 'new'}
              />

              <FormField
                label="Role"
                type="select"
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: String(value) })}
                options={roles}
                required
              />

              <FormField
                label="Department"
                type="text"
                value={formData.department}
                onChange={(value) => setFormData({ ...formData, department: String(value) })}
                placeholder="e.g., Content, Membership, Administration"
              />

              <FormField
                label="Position"
                type="text"
                value={formData.position}
                onChange={(value) => setFormData({ ...formData, position: String(value) })}
                placeholder="e.g., Manager, Coordinator, Specialist"
              />

              <FormField
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: String(value) })}
                placeholder="+250 ..."
              />

              <FormField
                label="Avatar URL"
                type="text"
                value={formData.avatar_url}
                onChange={(value) => setFormData({ ...formData, avatar_url: String(value) })}
                placeholder="https://example.com/avatar.jpg"
              />

              <FormField
                label="Location"
                type="text"
                value={formData.location}
                onChange={(value) => setFormData({ ...formData, location: String(value) })}
                placeholder="City, Country"
              />
            </div>

            <FormField
              label="Bio"
              type="textarea"
              value={formData.bio}
              onChange={(value) => setFormData({ ...formData, bio: String(value) })}
              rows={3}
              placeholder="Brief description about the user..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Form Access Permissions (comma-separated)"
                type="text"
                value={formData.form_access_permissions.join(', ')}
                onChange={(value) => handleArrayFieldChange('form_access_permissions', String(value))}
                placeholder="membership_applications, volunteer_applications, contact_submissions"
              />

              <FormField
                label="Content Access Permissions (comma-separated)"
                type="text"
                value={formData.content_access_permissions.join(', ')}
                onChange={(value) => handleArrayFieldChange('content_access_permissions', String(value))}
                placeholder="create, edit, publish, delete"
              />

              <FormField
                label="Admin Access Permissions (comma-separated)"
                type="text"
                value={formData.admin_access_permissions.join(', ')}
                onChange={(value) => handleArrayFieldChange('admin_access_permissions', String(value))}
                placeholder="users, settings, analytics, reports"
              />

              <FormField
                label="Approval Level"
                type="select"
                value={formData.approval_level.toString()}
                onChange={(value) => setFormData({ ...formData, approval_level: parseInt(String(value)) })}
                options={[
                  { value: '0', label: '0 - No approval rights' },
                  { value: '1', label: '1 - Can initiate content' },
                  { value: '2', label: '2 - Can review content' },
                  { value: '3', label: '3 - Can publish content' }
                ]}
              />
            </div>

            {/* Group Assignment Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Group Assignment</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.selectedGroups.includes(group.id)}
                      onChange={(e) => {
                        const newGroups = e.target.checked
                          ? [...formData.selectedGroups, group.id]
                          : formData.selectedGroups.filter(id => id !== group.id);
                        setFormData({ ...formData, selectedGroups: newGroups });
                      }}
                      className="rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{group.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {groups.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No groups available. Create groups first to assign users.
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send_welcome_email"
                    checked={formData.sendWelcomeEmail}
                    onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="send_welcome_email" className="text-sm font-medium text-gray-700">
                    Send Welcome Email
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="require_password_change"
                    checked={formData.requirePasswordChange}
                    onChange={(e) => setFormData({ ...formData, requirePasswordChange: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="require_password_change" className="text-sm font-medium text-gray-700">
                    Require Password Change on First Login
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active User
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_super_admin"
                  checked={formData.is_super_admin}
                  onChange={(e) => setFormData({ ...formData, is_super_admin: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_super_admin" className="text-sm font-medium text-gray-700">
                  Super Admin
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Users List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groups
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.display_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {user.display_name}
                        {user.is_super_admin && (
                          <Shield className="w-4 h-4 ml-2 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.department && (
                        <div className="text-xs text-gray-400">{user.department}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'super-admin'
                      ? 'bg-red-100 text-red-800'
                      : user.role === 'content-manager'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'editor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {roles.find(r => r.value === user.role)?.label || user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.userGroups && user.userGroups.length > 0 ? (
                      <>
                        {user.userGroups.slice(0, 2).map((group) => (
                          <span
                            key={group.groupId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: group.groupColor + '20',
                              color: group.groupColor
                            }}
                          >
                            {group.groupName}
                          </span>
                        ))}
                        {user.userGroups.length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{user.userGroups.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No groups</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {user.lastActivity
                      ? new Date(user.lastActivity).toLocaleDateString()
                      : 'Never'
                    }
                    {user.activityCount !== undefined && user.activityCount > 0 && (
                      <div className="text-xs text-gray-400">
                        {user.activityCount} activities
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleManageUserGroups(user.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Manage Groups"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(user.id, user.is_active)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={user.is_super_admin}
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {users.length === 0 ? 'No users found' : 'No users match your filters'}
          </p>
          <p className="text-gray-500 mb-4">
            {users.length === 0
              ? 'Create your first user to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {users.length === 0 && (
            <Button onClick={() => setEditingId('new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      )}

      {/* Group Management Modal */}
      {showGroupModal && selectedUserForGroups && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Manage Groups - {users.find(u => u.id === selectedUserForGroups)?.display_name}
              </h2>
              <Button variant="ghost" onClick={() => setShowGroupModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => {
                  const user = users.find(u => u.id === selectedUserForGroups);
                  const isInGroup = user?.userGroups?.some(ug => ug.groupId === group.id);

                  return (
                    <div key={group.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{group.name}</h3>
                            <p className="text-sm text-gray-500">{group.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isInGroup ? "outline" : "primary"}
                          className={isInGroup ? "text-red-600 hover:text-red-700" : ""}
                          onClick={() => handleUserGroupAssignment(group.id, !isInGroup)}
                        >
                          {isInGroup ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Management Activity Log</h2>
              <Button variant="ghost" onClick={() => setShowActivityModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {activityLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading activity...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activityData.length > 0 ? (
                  <div className="space-y-3">
                    {activityData.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.action.replace(/_/g, ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Resource: {activity.resource}
                          </p>
                          {activity.details && (
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No recent activity found</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowActivityModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Permission Management Tab */}
      {activeTab === 'permissions' && (
        <PermissionManager />
      )}

      {/* User Onboarding Modal */}
      {showOnboarding && newUserId && (
        <UserOnboarding
          userId={newUserId}
          userEmail={newUserEmail}
          onComplete={() => {
            setShowOnboarding(false);
            setNewUserId(null);
            setNewUserEmail('');
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setNewUserId(null);
            setNewUserEmail('');
          }}
        />
      )}
    </div>
  );
};

export default UserManager;