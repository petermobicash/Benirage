import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { signInWithEmail } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      // Check for bypass credentials for development
      if (loginData.email === 'admin@benirage.org' && loginData.password === 'password123') {
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format for mock admin
          email: loginData.email,
          user_metadata: {
            full_name: 'Super Administrator',
            role: 'admin'
          }
        };
        onLogin(mockUser as unknown as User);
        return;
      }

      const result = await signInWithEmail(loginData.email, loginData.password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center px-4">
      <Card variant="premium" className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 mb-2">CMS Login</h1>
          <p className="text-gray-600">Access the BENIRAGE admin system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] touch-manipulation text-base"
              placeholder="admin@benirage.org"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] touch-manipulation text-base"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔧 Development Mode</h3>
          <p className="text-blue-700 text-sm mb-3">
            Use these credentials for development:
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono">
            <p><strong>Email:</strong> admin@benirage.org</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;