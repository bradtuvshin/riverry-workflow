import React, { useState } from 'react';
import { 
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bell,
  Settings,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SKUManagement from './SKUManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';

const MasterPortal = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'skus', label: 'SKU Management', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const themeClasses = {
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    border: 'border-gray-200'
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'users':
        return <UserManagement themeClasses={themeClasses} />;
      case 'skus':
        return <SKUManagement themeClasses={themeClasses} />;
      case 'orders':
        return <OrderManagement themeClasses={themeClasses} />;
      default:
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">847</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Active Artists</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">23</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">$125,480</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Master Portal</h2>
                <p className="text-sm text-gray-500">Admin Control</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user?.firstName?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Master User</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {activeSection.replace(/([A-Z])/g, ' $1').trim()}
            </h1>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterPortal;
