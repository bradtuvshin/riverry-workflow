import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SKUManagement from './SKUManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';

const MasterPortal = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Mock data - replace with actual API calls
  const dashboardData = {
    revenue: { current: 125480, previous: 98430, growth: 27.5 },
    orders: { current: 847, previous: 623, growth: 36.0 },
    activeArtists: { current: 23, previous: 19, growth: 21.1 },
    alerts: { critical: 3, warning: 7, total: 10 }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'skus', label: 'SKU Management', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'payroll', label: 'Payroll Management', icon: DollarSign },
    { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: RefreshCw },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const themeClasses = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    sidebarBg: darkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200'
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return <Dashboard data={dashboardData} themeClasses={themeClasses} />;
      case 'users':
        return <UserManagement themeClasses={themeClasses} />;
      case 'skus':
        return <SKUManagement themeClasses={themeClasses} />;
      case 'orders':
        return <OrderManagement themeClasses={themeClasses} />;
      case 'payroll':
        return <PayrollManagement themeClasses={themeClasses} />;
      case 'analytics':
        return <Analytics themeClasses={themeClasses} />;
      case 'alerts':
        return <AlertsNotifications themeClasses={themeClasses} />;
      case 'integrations':
        return <Integrations themeClasses={themeClasses} />;
      case 'settings':
        return <SystemSettings themeClasses={themeClasses} />;
      default:
        return <Dashboard data={dashboardData} themeClasses={themeClasses} />;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 ${themeClasses.sidebarBg} ${themeClasses.border} border-r z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          {/* Logo & User */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`font-bold ${themeClasses.textPrimary}`}>Master Portal</h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>Admin Control</p>
              </div>
            </div>
            <button
              className="lg:hidden p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <X className={`w-5 h-5 ${themeClasses.textMuted}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false); // Close on mobile
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-purple-600 text-white' 
                      : `${themeClasses.textSecondary} hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'alerts' && dashboardData.alerts.total > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {dashboardData.alerts.total}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className={`${themeClasses.border} border rounded-lg p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.firstName?.charAt(0) || 'M'}
                  </span>
                </div>
                <div>
                  <p className={`font-medium ${themeClasses.textPrimary}`}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className={`text-sm ${themeClasses.textMuted}`}>Master User</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-2 px-3 py-2 ${themeClasses.textSecondary} hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-300`}>
        {/* Top Bar */}
        <div className={`${themeClasses.cardBg} ${themeClasses.border} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className={`w-5 h-5 ${themeClasses.textPrimary}`} />
              </button>
              <h1 className={`text-2xl font-bold ${themeClasses.textPrimary} capitalize`}>
                {activeSection.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <p className={`text-sm ${themeClasses.textMuted}`}>Revenue</p>
                  <p className={`font-bold ${themeClasses.textPrimary}`}>${dashboardData.revenue.current.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className={`text-sm ${themeClasses.textMuted}`}>Orders</p>
                  <p className={`font-bold ${themeClasses.textPrimary}`}>{dashboardData.orders.current}</p>
                </div>
              </div>
              
              {/* Alerts */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className={`w-5 h-5 ${themeClasses.textPrimary}`} />
                {dashboardData.alerts.total > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {dashboardData.alerts.total}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ data, themeClasses }) => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Revenue"
        value={`$${data.revenue.current.toLocaleString()}`}
        change={data.revenue.growth}
        icon={DollarSign}
        color="green"
        themeClasses={themeClasses}
      />
      <KPICard
        title="Active Orders"
        value={data.orders.current}
        change={data.orders.growth}
        icon={ShoppingCart}
        color="blue"
        themeClasses={themeClasses}
      />
      <KPICard
        title="Active Artists"
        value={data.activeArtists.current}
        change={data.activeArtists.growth}
        icon={Users}
        color="purple"
        themeClasses={themeClasses}
      />
      <KPICard
        title="System Alerts"
        value={data.alerts.total}
        change={null}
        icon={AlertTriangle}
        color="red"
        themeClasses={themeClasses}
      />
    </div>

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
        <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Recent Orders</h3>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className={`font-medium ${themeClasses.textPrimary}`}>Order #34466346{i}</p>
                <p className={`text-sm ${themeClasses.textMuted}`}>Customer Name • 2 tasks</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                In Progress
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
        <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Performance Overview</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Order Completion Rate</span>
              <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Artist On-Time Rate</span>
              <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>87%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Customer Satisfaction</span>
              <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>96%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '96%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color, themeClasses }) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${themeClasses.textMuted}`}>{title}</p>
          <p className={`text-2xl font-bold ${themeClasses.textPrimary} mt-1`}>{value}</p>
          {change !== null && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};


export default MasterPortal;
