/**
 * Audit Logger Utility
 * Tracks user activities and system events for compliance and monitoring
 */

import { supabase } from '../lib/supabase';


export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'user_management' | 'group_management' | 'permission_management' | 'content_management' | 'system';
}

export interface ActivitySummary {
  userId: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  timestamp: string;
  details?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private isEnabled: boolean = true;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID()
      };

      // Store in database (assuming audit_logs table exists)
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: logEntry.userId,
          action: logEntry.action,
          resource: logEntry.resource,
          resource_id: logEntry.resourceId,
          details: logEntry.details,
          ip_address: logEntry.ipAddress,
          user_agent: logEntry.userAgent,
          timestamp: logEntry.timestamp,
          severity: logEntry.severity,
          category: logEntry.category
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Audit logging error:', error);
      return false;
    }
  }

  public async logUserActivity(
    userId: string,
    activity: string,
    details?: AuditLogEntry['details'],
    severity: AuditLogEntry['severity'] = 'medium'
  ): Promise<boolean> {
    return this.log({
      userId,
      action: activity,
      resource: 'user_activity',
      details,
      severity,
      category: 'user_management'
    });
  }

  public async logUserCreation(
    createdBy: string,
    newUserId: string,
    newUserEmail: string,
    groupsAssigned?: string[]
  ): Promise<boolean> {
    return this.log({
      userId: createdBy,
      action: 'user_created',
      resource: 'user',
      resourceId: newUserId,
      details: {
        newUserEmail,
        groupsAssigned: groupsAssigned || [],
        timestamp: new Date().toISOString()
      },
      severity: 'high',
      category: 'user_management'
    });
  }

  public async logUserUpdate(
    updatedBy: string,
    targetUserId: string,
    changes: Record<string, unknown>
  ): Promise<boolean> {
    return this.log({
      userId: updatedBy,
      action: 'user_updated',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        changes,
        timestamp: new Date().toISOString()
      },
      severity: 'medium',
      category: 'user_management'
    });
  }

  public async logUserDeletion(
    deletedBy: string,
    targetUserId: string,
    targetUserEmail: string
  ): Promise<boolean> {
    return this.log({
      userId: deletedBy,
      action: 'user_deleted',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        deletedUserEmail: targetUserEmail,
        timestamp: new Date().toISOString()
      },
      severity: 'critical',
      category: 'user_management'
    });
  }

  public async logGroupAssignment(
    assignedBy: string,
    targetUserId: string,
    groupId: string,
    groupName: string,
    action: 'assigned' | 'removed'
  ): Promise<boolean> {
    return this.log({
      userId: assignedBy,
      action: `user_${action}_to_group`,
      resource: 'group_membership',
      resourceId: groupId,
      details: {
        targetUserId,
        groupName,
        timestamp: new Date().toISOString()
      },
      severity: 'medium',
      category: 'group_management'
    });
  }

  public async logBulkOperation(
    performedBy: string,
    operation: string,
    affectedUsers: string[],
    details?: Record<string, unknown>
  ): Promise<boolean> {
    return this.log({
      userId: performedBy,
      action: `bulk_${operation}`,
      resource: 'user_bulk_operation',
      details: {
        affectedUsersCount: affectedUsers.length,
        affectedUsers: affectedUsers.slice(0, 10), // Limit for performance
        operationDetails: details,
        timestamp: new Date().toISOString()
      },
      severity: 'high',
      category: 'user_management'
    });
  }

  public async getUserActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ActivitySummary[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map(log => ({
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        details: log.details ? JSON.stringify(log.details) : undefined
      }));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  public async getSystemActivity(
    category?: AuditLogEntry['category'],
    limit: number = 100,
    hoursBack?: number
  ): Promise<ActivitySummary[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (hoursBack) {
        const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();
        query = query.gte('timestamp', since);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(log => ({
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        details: log.details ? JSON.stringify(log.details) : undefined
      }));
    } catch (error) {
      console.error('Error fetching system activity:', error);
      return [];
    }
  }

  public async getActivityStats(
    userId?: string,
    hoursBack: number = 24
  ): Promise<{
    totalActivities: number;
    activitiesByCategory: Record<string, number>;
    activitiesBySeverity: Record<string, number>;
    recentActivities: ActivitySummary[];
  }> {
    try {
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', since);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const activities = data || [];
      const recentActivities = activities.slice(0, 10).map(log => ({
        userId: log.user_id,
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp,
        details: log.details ? JSON.stringify(log.details) : undefined
      }));

      const activitiesByCategory = activities.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const activitiesBySeverity = activities.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalActivities: activities.length,
        activitiesByCategory,
        activitiesBySeverity,
        recentActivities
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        totalActivities: 0,
        activitiesByCategory: {},
        activitiesBySeverity: {},
        recentActivities: []
      };
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience functions for common operations
export const logUserCreation = (createdBy: string, newUserId: string, newUserEmail: string, groupsAssigned?: string[]) =>
  auditLogger.logUserCreation(createdBy, newUserId, newUserEmail, groupsAssigned);

export const logUserUpdate = (updatedBy: string, targetUserId: string, changes: Record<string, unknown>) =>
  auditLogger.logUserUpdate(updatedBy, targetUserId, changes);

export const logUserDeletion = (deletedBy: string, targetUserId: string, targetUserEmail: string) =>
  auditLogger.logUserDeletion(deletedBy, targetUserId, targetUserEmail);

export const logGroupAssignment = (assignedBy: string, targetUserId: string, groupId: string, groupName: string, action: 'assigned' | 'removed') =>
  auditLogger.logGroupAssignment(assignedBy, targetUserId, groupId, groupName, action);

export const logBulkOperation = (performedBy: string, operation: string, affectedUsers: string[], details?: Record<string, unknown>) =>
  auditLogger.logBulkOperation(performedBy, operation, affectedUsers, details);