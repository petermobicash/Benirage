import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Check, X, Edit, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Suggestion } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface User {
  id: string;
  [key: string]: unknown;
}

interface SuggestionSystemProps {
  contentId: string;
  currentUser?: User;
}

const SuggestionSystem: React.FC<SuggestionSystemProps> = ({ contentId, currentUser }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState({
    type: 'improvement' as Suggestion['suggestion_type'],
    originalText: '',
    suggestedText: '',
    reason: ''
  });
  const [showForm, setShowForm] = useState(false);

  const loadSuggestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    loadSuggestions();
  }, [contentId, loadSuggestions]);

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.suggestedText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('suggestions')
        .insert([{
          content_id: contentId,
          user_id: user.id,
          suggestion_type: newSuggestion.type,
          original_text: newSuggestion.originalText,
          suggested_text: newSuggestion.suggestedText,
          reason: newSuggestion.reason,
          confidence_score: 0.8 // Default confidence
        }]);

      if (error) throw error;

      setNewSuggestion({
        type: 'improvement',
        originalText: '',
        suggestedText: '',
        reason: ''
      });
      setShowForm(false);
      loadSuggestions();

    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion');
    }
  };

  const handleSuggestionAction = async (suggestionId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({
          status: action,
          reviewed_by: currentUser?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      if (error) throw error;
      loadSuggestions();

    } catch (error) {
      console.error('Error updating suggestion:', error);
      alert('Failed to update suggestion');
    }
  };

  const getSuggestionIcon = (type: Suggestion['suggestion_type']) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'correction': return <Edit className="w-4 h-4 text-red-500" />;
      case 'enhancement': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'translation': return <Lightbulb className="w-4 h-4 text-green-500" />;
      case 'seo': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Suggestion['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-semibold text-dark-blue">
            Content Suggestions ({suggestions.length})
          </h3>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          {showForm ? 'Cancel' : 'Add Suggestion'}
        </Button>
      </div>

      {/* Suggestion Form */}
      {showForm && (
        <Card>
          <form onSubmit={submitSuggestion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Suggestion Type
                </label>
                <select
                  value={newSuggestion.type}
                  onChange={(e) => setNewSuggestion(prev => ({ 
                    ...prev, 
                    type: e.target.value as Suggestion['suggestion_type'] 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="improvement">Content Improvement</option>
                  <option value="correction">Error Correction</option>
                  <option value="enhancement">Feature Enhancement</option>
                  <option value="translation">Translation</option>
                  <option value="seo">SEO Optimization</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Original Text (Optional)
              </label>
              <textarea
                value={newSuggestion.originalText}
                onChange={(e) => setNewSuggestion(prev => ({ ...prev, originalText: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Copy the text you want to suggest changes for..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Suggested Text *
              </label>
              <textarea
                value={newSuggestion.suggestedText}
                onChange={(e) => setNewSuggestion(prev => ({ ...prev, suggestedText: e.target.value }))}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your suggested improvement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Reason for Suggestion
              </label>
              <textarea
                value={newSuggestion.reason}
                onChange={(e) => setNewSuggestion(prev => ({ ...prev, reason: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Explain why this suggestion would improve the content..."
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" icon={Lightbulb}>
                Submit Suggestion
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getSuggestionIcon(suggestion.suggestion_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {suggestion.suggestion_type.replace('_', ' ')} Suggestion
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                      {suggestion.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Confidence: {Math.round(suggestion.confidence_score * 100)}%
                    </span>
                  </div>

                  {suggestion.original_text && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-1">Original:</p>
                      <p className="text-sm text-red-700">{suggestion.original_text}</p>
                    </div>
                  )}

                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium mb-1">Suggested:</p>
                    <p className="text-sm text-green-700">{suggestion.suggested_text}</p>
                  </div>

                  {suggestion.reason && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">Reason:</p>
                      <p className="text-sm text-blue-700">{suggestion.reason}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(suggestion.created_at).toLocaleString()}
                    </span>
                    
                    {suggestion.status === 'pending' && currentUser && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSuggestionAction(suggestion.id, 'accepted')}
                          icon={Check}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuggestionAction(suggestion.id, 'rejected')}
                          icon={X}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Suggestions Yet</h3>
            <p className="text-gray-500">Be the first to suggest improvements for this content!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuggestionSystem;