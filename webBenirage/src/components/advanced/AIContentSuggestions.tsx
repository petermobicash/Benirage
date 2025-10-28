import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, CheckCircle, X, Lightbulb, Target, Zap, Eye, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { getCurrentAuthUser } from '../../utils/auth';

interface ContentSuggestion {
  id: string;
  type: 'seo' | 'readability' | 'engagement' | 'accessibility' | 'performance';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  suggestion: string;
  implementation: string;
  before?: string;
  after?: string;
}

interface AIContentSuggestionsProps {
  content: string;
  title: string;
  contentType: string;
  contentId: string;
  onApplySuggestion: (suggestion: ContentSuggestion) => void;
}

const AIContentSuggestions: React.FC<AIContentSuggestionsProps> = ({
  content,
  title,
  contentType,
  contentId,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const generateSuggestions = useCallback(async () => {
    setLoading(true);

    try {
      // Simulate AI analysis with realistic suggestions
      await new Promise(resolve => setTimeout(resolve, 1500));

      const generatedSuggestions: ContentSuggestion[] = [];

      // SEO Suggestions
      if (title.length < 30) {
        generatedSuggestions.push({
          id: 'seo-title-length',
          type: 'seo',
          title: 'Optimize Title Length',
          description: 'Title is too short for optimal SEO. Consider expanding to 30-60 characters.',
          impact: 'medium',
          confidence: 0.85,
          suggestion: 'Expand your title to include more descriptive keywords',
          implementation: 'Add relevant keywords that describe the content better',
          before: title,
          after: `${title} - Complete Guide for BENIRAGE Community`
        });
      }

      if (!content.includes('BENIRAGE') && contentType !== 'page') {
        generatedSuggestions.push({
          id: 'seo-brand-mention',
          type: 'seo',
          title: 'Add Brand Mention',
          description: 'Including your brand name helps with SEO and brand recognition.',
          impact: 'low',
          confidence: 0.75,
          suggestion: 'Consider mentioning BENIRAGE in the content',
          implementation: 'Add a natural reference to BENIRAGE in the introduction or conclusion'
        });
      }

      // Readability Suggestions
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

      if (avgSentenceLength > 20) {
        generatedSuggestions.push({
          id: 'readability-sentence-length',
          type: 'readability',
          title: 'Improve Readability',
          description: 'Some sentences are quite long. Breaking them up will improve readability.',
          impact: 'medium',
          confidence: 0.80,
          suggestion: 'Break long sentences into shorter, clearer ones',
          implementation: 'Aim for 15-20 words per sentence for better comprehension'
        });
      }

      // Engagement Suggestions
      if (!content.includes('?') && contentType === 'post') {
        generatedSuggestions.push({
          id: 'engagement-questions',
          type: 'engagement',
          title: 'Add Engaging Questions',
          description: 'Questions encourage reader interaction and comments.',
          impact: 'high',
          confidence: 0.90,
          suggestion: 'Add thought-provoking questions to engage readers',
          implementation: 'Include 1-2 questions that invite reflection or discussion',
          after: 'What aspects of this topic resonate most with your own experience?'
        });
      }

      if (content.length < 300 && contentType === 'post') {
        generatedSuggestions.push({
          id: 'engagement-content-depth',
          type: 'engagement',
          title: 'Expand Content Depth',
          description: 'Longer, more detailed content typically performs better.',
          impact: 'high',
          confidence: 0.85,
          suggestion: 'Consider expanding the content with more details and examples',
          implementation: 'Add personal stories, practical examples, or deeper insights'
        });
      }

      // Accessibility Suggestions
      if (content.includes('click here') || content.includes('read more')) {
        generatedSuggestions.push({
          id: 'accessibility-link-text',
          type: 'accessibility',
          title: 'Improve Link Accessibility',
          description: 'Generic link text like "click here" is not accessible to screen readers.',
          impact: 'medium',
          confidence: 0.95,
          suggestion: 'Use descriptive link text instead of generic phrases',
          implementation: 'Replace "click here" with descriptive text about the destination',
          before: 'Click here to learn more',
          after: 'Learn more about BENIRAGE spiritual practices'
        });
      }

      // Performance Suggestions
      if (content.length > 2000) {
        generatedSuggestions.push({
          id: 'performance-content-structure',
          type: 'performance',
          title: 'Improve Content Structure',
          description: 'Long content benefits from better structure with headings and sections.',
          impact: 'medium',
          confidence: 0.80,
          suggestion: 'Add headings and break content into digestible sections',
          implementation: 'Use H2 and H3 headings to create a clear content hierarchy'
        });
      }

      setSuggestions(generatedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      showToast('Failed to generate suggestions', 'error');
    } finally {
      setLoading(false);
    }
  }, [content, title, contentType, showToast]);

  useEffect(() => {
    if (content && title) {
      generateSuggestions();
    }
  }, [content, title, generateSuggestions]);

  const applySuggestion = async (suggestion: ContentSuggestion) => {
    try {
      const currentUser = getCurrentAuthUser();

      // Only save to database if user is authenticated and contentId is valid
      if (currentUser?.id && contentId) {
        const { error } = await supabase
          .from('suggestions')
          .insert([{
            content_id: contentId,
            user_id: currentUser.id,
            suggestion_type: suggestion.type,
            original_text: suggestion.before || '',
            suggested_text: suggestion.after || suggestion.suggestion,
            reason: suggestion.description,
            confidence_score: suggestion.confidence,
            status: 'implemented'
          }]);

        if (error) throw error;
      }

      setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
      onApplySuggestion(suggestion);
      showToast('Suggestion applied successfully', 'success');
    } catch (error) {
      console.error('Error applying suggestion:', error);
      showToast('Failed to apply suggestion', 'error');
    }
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo': return <TrendingUp className="w-4 h-4" />;
      case 'readability': return <Eye className="w-4 h-4" />;
      case 'engagement': return <Target className="w-4 h-4" />;
      case 'accessibility': return <Users className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center space-x-3 p-4">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <span className="text-purple-600">AI analyzing content...</span>
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className="bg-green-50 border border-green-200">
        <div className="flex items-center space-x-3 p-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            Great! No suggestions - your content looks excellent.
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-blue-900">
            AI Content Suggestions ({suggestions.length})
          </h3>
        </div>
        
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-4 ${
                appliedSuggestions.has(suggestion.id) 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    suggestion.type === 'seo' ? 'bg-blue-100 text-blue-600' :
                    suggestion.type === 'readability' ? 'bg-green-100 text-green-600' :
                    suggestion.type === 'engagement' ? 'bg-purple-100 text-purple-600' :
                    suggestion.type === 'accessibility' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 font-medium mb-1">Suggestion:</p>
                <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                
                {suggestion.before && suggestion.after && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs font-medium text-red-800 mb-1">Before:</p>
                      <p className="text-xs text-red-700">{suggestion.before}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-xs font-medium text-green-800 mb-1">After:</p>
                      <p className="text-xs text-green-700">{suggestion.after}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!appliedSuggestions.has(suggestion.id) ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      icon={CheckCircle}
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      icon={X}
                    >
                      Dismiss
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Applied</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AIContentSuggestions;