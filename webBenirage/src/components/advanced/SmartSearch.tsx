import React, { useState, useEffect, useCallback } from 'react';
import { Search, Tag, Calendar, User, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  slug: string;
  author: string;
  published_at: string;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  featured_image?: string;
}

interface SmartSearchProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  onResultClick,
  placeholder = "Search content, members, events...",
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    dateRange: 'all',
    author: 'all'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback(async () => {
    setLoading(true);
    
    try {
      let searchQuery = supabase
        .from('content')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters.type !== 'all') {
        searchQuery = searchQuery.eq('type', filters.type);
      }

      if (filters.author !== 'all') {
        searchQuery = searchQuery.eq('author', filters.author);
      }

      if (filters.category !== 'all') {
        searchQuery = searchQuery.contains('categories', [filters.category]);
      }

      // Text search using ilike for partial matching
      if (query.trim()) {
        const searchTerm = `%${query}%`;
        searchQuery = searchQuery.or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`);
      }

      // TODO: Implement date range filtering
      // if (filters.dateRange !== 'all') {
      //   const now = new Date();
      //   let startDate: Date;
      //   switch (filters.dateRange) {
      //     case 'week':
      //       startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      //       break;
      //     case 'month':
      //       startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      //       break;
      //     case 'year':
      //       startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      //       break;
      //     default:
      //       startDate = new Date(0);
      //   }
      //   searchQuery = searchQuery.gte('published_at', startDate.toISOString());
      // }

      const { data, error } = await searchQuery.limit(20);

      if (error) throw error;

      // Calculate relevance scores and format results
      const searchResults: SearchResult[] = (data || []).map(item => {
        let relevanceScore = 0;
        const queryLower = query.toLowerCase();
        
        // Title match (highest weight)
        if (item.title.toLowerCase().includes(queryLower)) {
          relevanceScore += 100;
        }
        
        // Excerpt match
        if (item.excerpt?.toLowerCase().includes(queryLower)) {
          relevanceScore += 50;
        }
        
        // Content match
        if (item.content?.toLowerCase().includes(queryLower)) {
          relevanceScore += 25;
        }
        
        // Tag match
        if (item.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
          relevanceScore += 75;
        }
        
        // Category match
        if (item.categories?.some((cat: string) => cat.toLowerCase().includes(queryLower))) {
          relevanceScore += 60;
        }

        return {
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || item.content.substring(0, 150) + '...',
          type: item.type,
          slug: item.slug,
          author: item.author,
          published_at: item.published_at || item.created_at,
          categories: item.categories || [],
          tags: item.tags || [],
          relevanceScore,
          featured_image: item.featured_image
        };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);

      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error performing search:', error);
      // Set empty results on error to prevent UI from hanging
      setResults([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  const generateSuggestions = useCallback(() => {
    const commonSearches = [
      'spiritual practices',
      'meditation guide',
      'cultural events',
      'philosophy workshop',
      'community programs',
      'volunteer opportunities',
      'membership benefits',
      'heritage preservation'
    ];

    const filtered = commonSearches.filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase()) && suggestion !== query
    );

    setSuggestions(filtered.slice(0, 5));
  }, [query]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
      generateSuggestions();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, filters, performSearch, generateSuggestions]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          onFocus={() => setShowResults(true)}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mt-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="post">Posts</option>
            <option value="page">Pages</option>
            <option value="event">Events</option>
            <option value="resource">Resources</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="spiritual">Spiritual</option>
            <option value="philosophy">Philosophy</option>
            <option value="culture">Culture</option>
            <option value="events">Events</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Any Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      )}

      {/* Search Results */}
      {showResults && (query.length > 2 || suggestions.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && query.length < 3 && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Searches</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </h4>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      onResultClick?.(result);
                      setShowResults(false);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {result.featured_image && (
                        <img
                          src={result.featured_image}
                          alt={result.title}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-blue-900 mb-1">
                          {highlightText(result.title, query)}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {highlightText(result.excerpt, query)}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{result.type}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{result.author}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(result.published_at).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{Math.round(result.relevanceScore)}% match</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : query.length > 2 && !loading ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">Try different keywords or check spelling</p>
            </div>
          ) : null}
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default SmartSearch;