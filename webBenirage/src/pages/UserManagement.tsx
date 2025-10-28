import UserManagementDashboard from '../components/admin/UserManagementDashboard';

const UserManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-blue-900">User Management</h1>
                <p className="text-sm text-gray-600">Permissions, Groups & Access Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserManagementDashboard />
      </div>
    </div>
  );
};

export default UserManagement;