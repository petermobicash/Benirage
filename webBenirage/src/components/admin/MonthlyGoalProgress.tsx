import React, { useState, useEffect } from 'react';
import { Target, Calendar, Plus, Edit, Trash2, CheckCircle, AlertCircle, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

interface MonthlyGoal {
  id: string;
  title: string;
  description: string;
  category: 'membership' | 'volunteer' | 'donation' | 'content' | 'engagement' | 'outreach';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue' | 'paused';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface MonthlyGoalProgressProps {
  isCompact?: boolean;
  onGoalClick?: (goal: MonthlyGoal) => void;
}

const MonthlyGoalProgress: React.FC<MonthlyGoalProgressProps> = ({
  isCompact = false,
  onGoalClick
}) => {
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'membership' as MonthlyGoal['category'],
    targetValue: 0,
    currentValue: 0,
    unit: 'count',
    endDate: '',
    priority: 'medium' as MonthlyGoal['priority']
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database records to component format
      const transformedGoals: MonthlyGoal[] = (data || []).map(record => ({
        id: record.id,
        title: record.title,
        description: record.description || '',
        category: record.category as MonthlyGoal['category'],
        targetValue: record.target_value,
        currentValue: record.current_value,
        unit: record.unit,
        startDate: record.start_date,
        endDate: record.end_date,
        status: record.status as MonthlyGoal['status'],
        priority: record.priority as MonthlyGoal['priority'],
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }));

      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      // Fallback to sample data if database fails
      const sampleGoals: MonthlyGoal[] = [
        {
          id: '1',
          title: 'New Membership Applications',
          description: 'Increase membership applications by 25%',
          category: 'membership',
          targetValue: 50,
          currentValue: 32,
          unit: 'applications',
          startDate: '2024-10-01',
          endDate: '2024-10-31',
          status: 'active',
          priority: 'high',
          createdAt: '2024-10-01',
          updatedAt: '2024-10-18'
        }
      ];
      setGoals(sampleGoals);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (status: MonthlyGoal['status']): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'paused': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: MonthlyGoal['priority']): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: MonthlyGoal['category']): string => {
    switch (category) {
      case 'membership': return '👥';
      case 'volunteer': return '🤝';
      case 'donation': return '💰';
      case 'content': return '📝';
      case 'engagement': return '💬';
      case 'outreach': return '🌍';
      default: return '🎯';
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'USD') {
      return `$${value.toLocaleString()}`;
    }
    if (unit === 'percentage') {
      return `${value}%`;
    }
    return `${value} ${unit}`;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'membership',
      targetValue: 0,
      currentValue: 0,
      unit: 'count',
      endDate: '',
      priority: 'medium'
    });
    setEditingGoal(null);
    setShowAddForm(false);
  };

  const handleCreateGoal = async () => {
    if (!formData.title || !formData.targetValue || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to create goals');
        return;
      }

      const { data, error } = await supabase
        .from('monthly_goals')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_value: formData.targetValue,
          current_value: formData.currentValue,
          unit: formData.unit,
          start_date: new Date().toISOString().split('T')[0],
          end_date: formData.endDate,
          priority: formData.priority,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the database record back to component format
      const newGoal: MonthlyGoal = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        category: data.category as MonthlyGoal['category'],
        targetValue: data.target_value,
        currentValue: data.current_value,
        unit: data.unit,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status as MonthlyGoal['status'],
        priority: data.priority as MonthlyGoal['priority'],
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setGoals(prev => [newGoal, ...prev]);
      resetForm();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !formData.title || !formData.targetValue || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('monthly_goals')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          target_value: formData.targetValue,
          current_value: formData.currentValue,
          unit: formData.unit,
          end_date: formData.endDate,
          priority: formData.priority
        })
        .eq('id', editingGoal.id);

      if (error) throw error;

      // Update local state
      setGoals(prev => prev.map(goal =>
        goal.id === editingGoal.id
          ? {
              ...goal,
              title: formData.title,
              description: formData.description,
              category: formData.category,
              targetValue: formData.targetValue,
              currentValue: formData.currentValue,
              unit: formData.unit,
              endDate: formData.endDate,
              priority: formData.priority,
              updatedAt: new Date().toISOString()
            }
          : goal
      ));

      resetForm();
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  const handleEditGoal = (goal: MonthlyGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      endDate: goal.endDate,
      priority: goal.priority
    });
    setShowAddForm(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        const { error } = await supabase
          .from('monthly_goals')
          .delete()
          .eq('id', goalId);

        if (error) throw error;

        setGoals(prev => prev.filter(goal => goal.id !== goalId));
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    // Find the goal to get target value
    const currentGoal = goals.find(g => g.id === goalId);
    if (!currentGoal) return;

    const newStatus = newValue >= currentGoal.targetValue ? 'completed' : 'active';

    // Update local state immediately for responsive UI
    setGoals(prev => prev.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            currentValue: newValue,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }
        : goal
    ));

    // Persist to database
    try {
      const { error } = await supabase
        .from('monthly_goals')
        .update({
          current_value: newValue,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) {
        console.error('Error updating progress in database:', error);
        // Revert local state if database update fails
        loadGoals();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      // Revert local state if database update fails
      loadGoals();
    }
  };

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((acc, goal) => acc + getProgressPercentage(goal.currentValue, goal.targetValue), 0) / goals.length)
    : 0;

  const activeGoals = goals.filter(goal => goal.status === 'active').length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;

  if (loading) {
    return (
      <Card className={`p-6 ${isCompact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading goals...</span>
        </div>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Monthly Goals</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{overallProgress}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        <div className="space-y-3">
          {goals.slice(0, 3).map((goal) => {
            const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
            return (
              <div key={goal.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">{goal.title}</span>
                  <span className="text-gray-500">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} height="sm" />
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{activeGoals} active</span>
            <span>{completedGoals} completed</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monthly Goal Progress</h2>
            <p className="text-gray-600 text-sm">Track your monthly objectives and achievements</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
            <div className="text-sm text-gray-500">Overall Progress</div>
          </div>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
          <div className="text-sm text-blue-700">Active Goals</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{goals.length}</div>
          <div className="text-sm text-purple-700">Total Goals</div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal.currentValue, goal.targetValue);
          const isOverdue = new Date(goal.endDate) < new Date() && goal.status !== 'completed';

          return (
            <div
              key={goal.id}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                goal.status === 'completed' ? 'bg-green-50 border-green-200' :
                isOverdue ? 'bg-red-50 border-red-200' :
                'bg-white border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onGoalClick?.(goal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={goal.currentValue}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newValue = parseInt(e.target.value) || 0;
                        handleUpdateProgress(goal.id, newValue);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      title="Update current progress"
                    />
                    <span className="font-medium text-gray-500">/ {formatValue(goal.targetValue, goal.unit)}</span>
                  </div>
                </div>
                <ProgressBar
                  progress={progress}
                  height="md"
                  color={goal.status === 'completed' ? 'success' : isOverdue ? 'error' : 'primary'}
                  animated
                  showPercentage
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Due: {new Date(goal.endDate).toLocaleDateString()}</span>
                  <span className={`flex items-center space-x-1 ${
                    isOverdue ? 'text-red-600' : ''
                  }`}>
                    {isOverdue ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : goal.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>
                      {isOverdue ? 'Overdue' : goal.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Edit}
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleEditGoal(goal);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Set</h3>
          <p className="text-gray-600 mb-4">Start by creating your first monthly goal to track progress.</p>
          <Button icon={Plus} onClick={() => setShowAddForm(true)}>
            Create Your First Goal
          </Button>
        </div>
      )}

      {/* Goal Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={X}
                  onClick={resetForm}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter goal title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your goal"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MonthlyGoal['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="membership">Membership</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="donation">Donation</option>
                      <option value="content">Content</option>
                      <option value="engagement">Engagement</option>
                      <option value="outreach">Outreach</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as MonthlyGoal['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value *
                    </label>
                    <input
                      type="number"
                      value={formData.targetValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Value
                    </label>
                    <input
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentValue: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="count">Count</option>
                      <option value="USD">USD</option>
                      <option value="percentage">Percentage</option>
                      <option value="applications">Applications</option>
                      <option value="volunteers">Volunteers</option>
                      <option value="posts">Posts</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingGoal ? handleUpdateGoal : handleCreateGoal}
                  icon={Save}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default MonthlyGoalProgress;