import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Clock, User, MessageCircle } from 'lucide-react';
import { WhatsAppMessage } from '../../hooks/useRealTimeChat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MessageSearchProps {
  messages: WhatsAppMessage[];
  onMessageSelect?: (message: WhatsAppMessage) => void;
  onClose?: () => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  onMessageSelect,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WhatsAppMessage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const handleMessageSelect = useCallback((message: WhatsAppMessage) => {
    onMessageSelect?.(message);
    onClose?.();
  }, [onMessageSelect, onClose]);

  // Search messages when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = messages.filter(message =>
        message.message_text.toLowerCase().includes(query) ||
        message.sender_name.toLowerCase().includes(query)
      );

      setSearchResults(results);
      setSelectedIndex(-1);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, messages]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleMessageSelect(searchResults[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, onClose, handleMessageSelect]);


  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Card className="w-96 max-h-[500px] flex flex-col">
      {/* Search Header */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        ) : searchQuery.trim() ? (
          searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 mb-2">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>

              {searchResults.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMessageSelect(message)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {highlightText(message.sender_name, searchQuery)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {highlightText(message.message_text, searchQuery)}
                      </p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          <MessageCircle className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-1">No messages found</p>
              <p className="text-sm text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-1">Search messages</p>
            <p className="text-sm text-gray-400">
              Type to find messages by content or sender
            </p>
          </div>
        )}
      </div>

      {/* Search Tips */}
      {searchQuery.trim() && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="mb-1"><strong>Tips:</strong></p>
            <p>• Use ↑↓ arrows to navigate results</p>
            <p>• Press Enter to jump to message</p>
            <p>• Press Esc to close search</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MessageSearch;