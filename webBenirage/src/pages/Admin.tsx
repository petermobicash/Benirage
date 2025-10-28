import React, { useState, useEffect } from 'react';
import { supabase, signInWithEmail, signOut, getCurrentUser } from '../lib/supabase';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Admin = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        // Redirect to CMS page instead of showing dashboard
        window.location.href = '/cms';
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load membership applications
      const { data: memberships } = await supabase
        .from('membership_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load volunteer applications
      const { data: volunteers } = await supabase
        .from('volunteer_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load contact submissions
      const { data: contacts } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load donations
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .order('donation_date', { ascending: false });

      setDashboardData({
        memberships: memberships || [],
        volunteers: volunteers || [],
        contacts: contacts || [],
        donations: donations || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await signInWithEmail(loginData.email, loginData.password);
      if (result.success) {
        // Redirect to CMS page instead of showing dashboard
        window.location.href = '/cms';
      } else {
        alert(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setDashboardData(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center px-4">
        <Card variant="premium" className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Access the BENIRAGE content management system</p>
          </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-blue-900">BENIRAGE Admin</h1>
                <p className="text-sm text-gray-600">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">Manage your BENIRAGE website content and applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            🔄 Refresh Data
          </Button>
        </div>

        {/* Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin?section=memberships'}>
              <div className="text-3xl font-bold text-blue-600">{dashboardData.memberships.length}</div>
              <p className="text-gray-600">Membership Applications</p>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin?section=volunteers'}>
              <div className="text-3xl font-bold text-green-600">{dashboardData.volunteers.length}</div>
              <p className="text-gray-600">Volunteer Applications</p>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin?section=contacts'}>
              <div className="text-3xl font-bold text-purple-600">{dashboardData.contacts.length}</div>
              <p className="text-gray-600">Contact Submissions</p>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin?section=donations'}>
              <div className="text-3xl font-bold text-yellow-600">{dashboardData.donations.length}</div>
              <p className="text-gray-600">Donations</p>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">📝 Content Management</h3>
            <p className="text-gray-600 mb-4">Create and manage website content</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/cms'}>
              Manage Content
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">👥 Membership Applications</h3>
            <p className="text-gray-600 mb-4">Review and process membership applications</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=memberships'}>
              View Applications
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">🤝 Volunteer Management</h3>
            <p className="text-gray-600 mb-4">Manage volunteer applications and assignments</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=volunteers'}>
              Manage Volunteers
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">📧 Contact Messages</h3>
            <p className="text-gray-600 mb-4">Respond to contact form submissions</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=contacts'}>
              View Messages
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">💰 Donations</h3>
            <p className="text-gray-600 mb-4">Track and manage donations</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=donations'}>
              View Donations
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">⚙️ Settings</h3>
            <p className="text-gray-600 mb-4">Configure website settings</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=settings'}>
              Manage Settings
            </Button>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">👥 User Management</h3>
            <p className="text-gray-600 mb-4">Manage permissions, groups, and user access control</p>
            <Button variant="primary" size="sm" onClick={() => window.location.href = '/admin?section=user-management'}>
              Manage Users & Permissions
            </Button>
          </Card>
        </div>

        {/* Recent Activity */}
        {dashboardData && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Recent Activity</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Latest Membership Applications</h4>
                <div className="space-y-3">
                  {dashboardData.memberships.slice(0, 5).map((member: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {member.status}
                      </span>
                    </div>
                  ))}
                  {dashboardData.memberships.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No membership applications yet</p>
                  )}
                </div>
              </Card>

              <Card>
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Latest Contact Messages</h4>
                <div className="space-y-3">
                  {dashboardData.contacts.slice(0, 5).map((contact: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-900">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-gray-600">{contact.subject}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {contact.status}
                      </span>
                    </div>
                  ))}
                  {dashboardData.contacts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No contact messages yet</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;