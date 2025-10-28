import React, { useState } from 'react';
import { MessageSquare, User, Mail, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface GuestChatEntryProps {
  onJoinChat: (guestInfo: { name: string; email: string }) => void;
  loading?: boolean;
}

const GuestChatEntry: React.FC<GuestChatEntryProps> = ({ onJoinChat, loading = false }) => {
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestInfo.name.trim() && guestInfo.email.trim()) {
      onJoinChat(guestInfo);
    }
  };

  const handleInputChange = (field: 'name' | 'email', value: string) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">Join Community Chat</h2>
        <p className="text-gray-600">Connect with the BENIRAGE community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="guest-name"
              type="text"
              value={guestInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="guest-email"
              type="email"
              value={guestInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              required
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            We'll use this to connect you with the community and send updates
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!guestInfo.name.trim() || !guestInfo.email.trim() || loading}
        >
          {loading ? (
            'Joining...'
          ) : (
            <>
              Start Chatting
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">What to expect:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• WhatsApp-like chat interface</li>
            <li>• Real-time messaging with community</li>
            <li>• Connect with other members</li>
            <li>• File and image sharing</li>
            <li>• Community discussions and support</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default GuestChatEntry;