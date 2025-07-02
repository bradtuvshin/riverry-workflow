import React from 'react';
import { LogOut, User, Settings, Users, Package, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminPortal = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Portal
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName}!
            </p>
          </div>
          
          {/* User Menu with Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role} Account
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Portal Coming Soon
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The admin portal is currently under development. You'll soon be able to manage users, 
            view system analytics, and configure platform settings from here.
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
              <p className="text-sm text-gray-600">
                Manage artist accounts, permissions, and performance tracking
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">
                View system-wide performance metrics and business insights
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <Package className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Order Oversight</h3>
              <p className="text-sm text-gray-600">
                Monitor order flow, quality control, and customer satisfaction
              </p>
            </div>
          </div>

          {/* Demo Links */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-4">
              Want to explore other portals?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/artist'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Artist Portal
              </button>
              <button
                onClick={() => window.location.href = '/master'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                👑 Master Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
