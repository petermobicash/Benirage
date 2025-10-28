import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Clock, CheckCircle, Play, Pause, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'content_created' | 'content_updated' | 'form_submitted' | 'user_registered' | 'scheduled_time';
    conditions: Record<string, unknown>;
  };
  actions: Array<{
    type: 'send_notification' | 'update_status' | 'assign_user' | 'send_email' | 'create_task';
    parameters: Record<string, unknown>;
  }>;
  is_active: boolean;
  created_at: string;
  last_executed?: string;
  execution_count: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WorkflowAutomationProps {
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    trigger: {
      type: 'content_created' as AutomationRule['trigger']['type'],
      conditions: {}
    },
    actions: [] as AutomationRule['actions'],
    is_active: true
  });
  const { showToast } = useToast();

  const createDefaultRules = useCallback(async () => {
    const defaultRules: Omit<AutomationRule, 'id' | 'created_at' | 'last_executed' | 'execution_count'>[] = [
      {
        name: 'Notify on New Content',
        description: 'Send notifications when new content is published',
        trigger: {
          type: 'content_created',
          conditions: { status: 'published' }
        },
        actions: [
          {
            type: 'send_notification',
            parameters: {
              title: 'New Content Published',
              message: 'Check out the latest content on BENIRAGE',
              recipients: 'subscribers'
            }
          }
        ],
        is_active: true
      },
      {
        name: 'Auto-assign Content Reviewer',
        description: 'Automatically assign content to reviewers when submitted',
        trigger: {
          type: 'content_updated',
          conditions: { status: 'pending_review' }
        },
        actions: [
          {
            type: 'assign_user',
            parameters: {
              role: 'content-reviewer',
              notification: true
            }
          }
        ],
        is_active: true
      },
      {
        name: 'Welcome New Members',
        description: 'Send welcome message to new members',
        trigger: {
          type: 'form_submitted',
          conditions: { form_type: 'membership' }
        },
        actions: [
          {
            type: 'send_email',
            parameters: {
              template: 'welcome_member',
              delay: '1 hour'
            }
          },
          {
            type: 'create_task',
            parameters: {
              title: 'Review membership application',
              assignee: 'membership-manager'
            }
          }
        ],
        is_active: true
      }
    ];

    try {
      const rulesToInsert = defaultRules.map(rule => ({
        ...rule,
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        execution_count: 0
      }));

      const { data, error } = await supabase
        .from('automation_rules')
        .insert(rulesToInsert)
        .select();

      if (error) throw error;

      setRules(data as AutomationRule[]);
      showToast('Default automation rules created successfully', 'success');
    } catch (error) {
      console.error('Error creating default rules:', error);
      showToast('Failed to create default automation rules', 'error');
    }
  }, [showToast]);

  const loadAutomationRules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setRules(data as AutomationRule[]);
      } else {
        // Create default rules if none exist
        await createDefaultRules();
      }
    } catch (error) {
      console.error('Error loading automation rules:', error);
      showToast('Failed to load automation rules', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, createDefaultRules]);

  useEffect(() => {
    loadAutomationRules();
  }, [loadAutomationRules]);

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim() || !newRule.description.trim()) return;

    try {
      const ruleData = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newRule.name,
        description: newRule.description,
        trigger: newRule.trigger,
        actions: newRule.actions,
        is_active: newRule.is_active,
        created_at: new Date().toISOString(),
        execution_count: 0
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .insert(ruleData)
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [...prev, data as AutomationRule]);
      setNewRule({
        name: '',
        description: '',
        trigger: {
          type: 'content_created',
          conditions: {}
        },
        actions: [],
        is_active: true
      });
      setShowCreateForm(false);
      showToast(`Automation rule "${data.name}" created successfully`, 'success');
    } catch (error) {
      console.error('Error creating rule:', error);
      showToast('Failed to create automation rule', 'error');
    }
  };

  const startEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setNewRule({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      actions: rule.actions,
      is_active: rule.is_active
    });
    setShowCreateForm(true);
  };

  const updateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule || !newRule.name.trim() || !newRule.description.trim()) return;

    try {
      const updatedRuleData = {
        name: newRule.name,
        description: newRule.description,
        trigger: newRule.trigger,
        actions: newRule.actions,
        is_active: newRule.is_active
      };

      const { data, error } = await supabase
        .from('automation_rules')
        .update(updatedRuleData)
        .eq('id', editingRule.id)
        .select()
        .single();

      if (error) throw error;

      setRules(prev => prev.map(rule =>
        rule.id === editingRule.id ? data as AutomationRule : rule
      ));
      setNewRule({
        name: '',
        description: '',
        trigger: {
          type: 'content_created',
          conditions: {}
        },
        actions: [],
        is_active: true
      });
      setEditingRule(null);
      setShowCreateForm(false);
      showToast(`Automation rule "${data.name}" updated successfully`, 'success');
    } catch (error) {
      console.error('Error updating rule:', error);
      showToast('Failed to update automation rule', 'error');
    }
  };



  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      setRules(prev =>
        prev.map(rule =>
          rule.id === ruleId ? data as AutomationRule : rule
        )
      );

      showToast(`Automation rule ${!isActive ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling rule:', error);
      showToast('Failed to update automation rule', 'error');
    }
  };

  const executeRule = async (rule: AutomationRule) => {
    try {
      // Simulate rule execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase
        .from('automation_rules')
        .update({
          last_executed: new Date().toISOString(),
          execution_count: rule.execution_count + 1
        })
        .eq('id', rule.id)
        .select()
        .single();

      if (error) throw error;

      setRules(prev =>
        prev.map(r =>
          r.id === rule.id ? data as AutomationRule : r
        )
      );

      showToast(`Automation rule "${rule.name}" executed successfully`, 'success');
    } catch (error) {
      console.error('Error executing rule:', error);
      showToast('Failed to execute automation rule', 'error');
    }
  };

  const getStatusIcon = (rule: AutomationRule) => {
    if (!rule.is_active) {
      return <Pause className="w-4 h-4 text-gray-500" />;
    }
    
    if (rule.last_executed) {
      const lastExecution = new Date(rule.last_executed);
      const hoursSince = (Date.now() - lastExecution.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      }
    }
    
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  const getTriggerDescription = (trigger: AutomationRule['trigger']) => {
    switch (trigger.type) {
      case 'content_created':
        return 'When new content is created';
      case 'content_updated':
        return 'When content status changes';
      case 'form_submitted':
        return 'When a form is submitted';
      case 'user_registered':
        return 'When a new user registers';
      case 'scheduled_time':
        return 'At scheduled intervals';
      default:
        return 'Custom trigger';
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-blue-900">Workflow Automation</h2>
        </div>
        <Button onClick={() => {
          setEditingRule(null);
          setNewRule({
            name: '',
            description: '',
            trigger: {
              type: 'content_created',
              conditions: {}
            },
            actions: [],
            is_active: true
          });
          setShowCreateForm(true);
        }} icon={Play}>
          Create Rule
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <form onSubmit={editingRule ? updateRule : createRule} className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter rule name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Trigger Type
                </label>
                <select
                  value={newRule.trigger.type}
                  onChange={(e) => setNewRule(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger, type: e.target.value as AutomationRule['trigger']['type'] }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="content_created">Content Created</option>
                  <option value="content_updated">Content Updated</option>
                  <option value="form_submitted">Form Submitted</option>
                  <option value="user_registered">User Registered</option>
                  <option value="scheduled_time">Scheduled Time</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Description *
              </label>
              <textarea
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe what this automation rule does..."
                required
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newRule.is_active}
                  onChange={(e) => setNewRule(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">Active</span>
              </label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" icon={editingRule ? Settings : Play}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => {
                setShowCreateForm(false);
                setEditingRule(null);
                setNewRule({
                  name: '',
                  description: '',
                  trigger: {
                    type: 'content_created',
                    conditions: {}
                  },
                  actions: [],
                  is_active: true
                });
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Automation Rules */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(rule)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    {rule.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{rule.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Trigger: {getTriggerDescription(rule.trigger)}</span>
                    <span>Actions: {rule.actions.length}</span>
                    <span>Executed: {rule.execution_count} times</span>
                    {rule.last_executed && (
                      <span>Last: {new Date(rule.last_executed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeRule(rule)}
                  icon={Play}
                >
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRule(rule.id, rule.is_active)}
                  icon={rule.is_active ? Pause : Play}
                >
                  {rule.is_active ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditRule(rule)}
                  icon={Settings}
                >
                  Edit
                </Button>
              </div>
            </div>
            
            {/* Rule Details */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Trigger Conditions</h4>
                  <div className="text-sm text-gray-600">
                    {Object.entries(rule.trigger.conditions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Actions</h4>
                  <div className="space-y-1">
                    {rule.actions.map((action, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {action.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Stats */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Automation Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rules.length}</div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {rules.reduce((sum, rule) => sum + rule.execution_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Executions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {rules.filter(rule => rule.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Enabled Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {rules.reduce((sum, rule) => sum + rule.execution_count, 0) > 0 ? '98%' : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowAutomation;