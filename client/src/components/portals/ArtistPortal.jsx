import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Eye,
  Star,
  Crown,
  TrendingUp,
  Zap,
  Moon,
  Sun,
  ChevronRight,
  X,
  Package,
  Palette
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ArtistPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mock orders data - replace with actual API call
  const mockOrders = [
    {
      orderId: '344663465',
      status: 'pending',
      totalPayout: 45,
      dueDate: '2025-07-05',
      customerName: 'Sarah Johnson',
      taskCount: 3,
      priority: 'normal',
      tasks: [
        {
          taskId: '344663465-1',
          title: 'Pet Headshot Portrait',
          paintingStyle: 'Regular Headshot',
          sku: 'Regular_headshot_12x16p',
          payRate: 10,
          status: 'assigned',
          description: '12x16 poster of golden retriever'
        },
        {
          taskId: '344663465-2', 
          title: 'Pet Mini Full Body',
          paintingStyle: '2 Pet Mini Full Body',
          sku: '2pet_mini_fullbody_5x7nw',
          payRate: 10,
          status: 'assigned',
          description: '5x7 natural wood frame with 2 cats'
        },
        {
          taskId: '344663465-3',
          title: 'House + Landscape + Pets',
          paintingStyle: 'House + Landscape + 3 Pets',
          sku: 'house+landscape+3pets_8x10bf',
          payRate: 25,
          status: 'assigned',
          description: '8x10 black frame with house, garden, and 3 dogs'
        }
      ]
    },
    {
      orderId: '344663466',
      status: 'submitted',
      totalPayout: 35,
      dueDate: '2025-07-03',
      customerName: 'Mike Chen',
      taskCount: 2,
      priority: 'urgent',
      tasks: [
        {
          taskId: '344663466-1',
          title: 'Wedding Portrait',
          paintingStyle: 'Couple Portrait',
          sku: 'couple_portrait_16x20p',
          payRate: 20,
          status: 'submitted',
          description: '16x20 poster of wedding couple'
        },
        {
          taskId: '344663466-2',
          title: 'Pet Memorial',
          paintingStyle: 'Pet Memorial',
          sku: 'pet_memorial_8x10bf',
          payRate: 15,
          status: 'submitted',
          description: '8x10 black frame memorial portrait'
        }
      ]
    },
    {
      orderId: '344663467',
      status: 'completed',
      totalPayout: 20,
      dueDate: '2025-06-28',
      customerName: 'Lisa Park',
      taskCount: 1,
      priority: 'normal',
      tasks: [
        {
          taskId: '344663467-1',
          title: 'Family Portrait',
          paintingStyle: 'Family Portrait',
          sku: 'family_portrait_11x14f',
          payRate: 20,
          status: 'completed',
          description: '11x14 framed family of 4'
        }
      ]
    }
  ];

  const submitTaskMutation = useMutation({
    mutationFn: tasksAPI.submitTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['artist-orders']);
    }
  });

  // Get current pay period
  const getCurrentPayPeriod = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    if (day <= 15) {
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month, 15),
        period: 1
      };
    } else {
      const lastDay = new Date(year, month + 1, 0).getDate();
      return {
        start: new Date(year, month, 16),
        end: new Date(year, month, lastDay),
        period: 2
      };
    }
  };

  const currentPeriod = getCurrentPayPeriod();

  // Filter orders by tab
  const getOrdersForTab = (tab) => {
    switch(tab) {
      case 'pending': 
        return mockOrders.filter(o => o.status === 'pending');
      case 'submitted': 
        return mockOrders.filter(o => o.status === 'submitted');
      case 'paid': 
        return mockOrders.filter(o => o.status === 'completed');
      default: 
        return [];
    }
  };

  // Calculate earnings and stats
  const calculateStats = () => {
    const pendingOrders = mockOrders.filter(o => o.status === 'pending');
    const submittedOrders = mockOrders.filter(o => o.status === 'submitted');
    const paidOrders = mockOrders.filter(o => o.status === 'completed');
    
    const pendingEarnings = submittedOrders.reduce((sum, order) => sum + order.totalPayout, 0);
    const thisPeriodsEarnings = submittedOrders.reduce((sum, order) => sum + order.totalPayout, 0);
    const lifetimeEarnings = paidOrders.reduce((sum, order) => sum + order.totalPayout, 0);
    
    // Mock on-time percentage
    const onTimePercentage = 85;
    const isGoldStatus = onTimePercentage >= 80;
    const goldBonus = isGoldStatus ? thisPeriodsEarnings * 0.2 : 0;
    
    return {
      pendingCount: pendingOrders.length,
      submittedCount: submittedOrders.length,
      paidCount: paidOrders.length,
      pendingEarnings,
      thisPeriodsEarnings,
      lifetimeEarnings,
      goldBonus,
      onTimePercentage,
      isGoldStatus
    };
  };

  const stats = calculateStats();

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStartTask = (taskId) => {
    console.log('Start task:', taskId);
    // Update task status to in_progress
  };

  const handleSubmitTask = (taskId) => {
    console.log('Submit task:', taskId);
    // Submit individual task
  };

  const handleSubmitOrder = (orderId) => {
    console.log('Submit entire order:', orderId);
    // Submit all tasks in the order
  };

  // Theme classes
  const themeClasses = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    gradientCard: darkMode 
      ? 'from-gray-800 to-gray-700' 
      : 'from-gray-50 to-gray-100'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header with Theme Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
              Welcome back, {user?.firstName}! 
            </h1>
            <p className={`${themeClasses.textSecondary} mt-1`}>
              Pay Period: {currentPeriod.start.toLocaleDateString()} - {currentPeriod.end.toLocaleDateString()}
            </p>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-4 sm:mt-0 p-3 rounded-full ${themeClasses.cardBg} ${themeClasses.border} border hover:shadow-lg transition-all duration-200`}
          >
            {darkMode ? (
              <Sun className={`w-5 h-5 ${themeClasses.textPrimary}`} />
            ) : (
              <Moon className={`w-5 h-5 ${themeClasses.textPrimary}`} />
            )}
          </button>
        </div>

        {/* Artist Status Card */}
        <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-r ${themeClasses.gradientCard}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stats.isGoldStatus ? 'bg-yellow-100' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {stats.isGoldStatus ? (
                  <Crown className="w-8 h-8 text-yellow-600" />
                ) : (
                  <Star className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${stats.isGoldStatus ? 'text-yellow-600' : themeClasses.textPrimary}`}>
                  {stats.isGoldStatus ? '👑 GOLD ARTIST' : '🥈 SILVER ARTIST'}
                </h2>
                <p className={themeClasses.textSecondary}>
                  {stats.onTimePercentage}% On-Time This Period
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${stats.isGoldStatus ? 'text-yellow-600' : themeClasses.textPrimary}`}>
                {stats.onTimePercentage}%
              </div>
              <div className={`text-sm ${themeClasses.textMuted}`}>
                {stats.isGoldStatus ? '+20% Bonus Eligible' : `${80 - stats.onTimePercentage}% to Gold`}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`flex justify-between text-xs ${themeClasses.textMuted} mb-1`}>
              <span>Silver (0%)</span>
              <span>Gold (80%)</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.isGoldStatus ? 'bg-yellow-500' : darkMode ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(stats.onTimePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Earnings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Earnings */}
          <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-br ${darkMode ? 'from-orange-900 to-orange-800' : 'from-orange-50 to-orange-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Pending Payment</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                  ${stats.pendingEarnings.toFixed(0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {stats.submittedCount} orders submitted
                </p>
              </div>
              <Clock className={`w-8 h-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
          </div>

          {/* This Pay Period */}
          <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-br ${darkMode ? 'from-blue-900 to-blue-800' : 'from-blue-50 to-blue-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>This Pay Period</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                  ${stats.thisPeriodsEarnings.toFixed(0)}
                </p>
                {stats.goldBonus > 0 && (
                  <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>
                    <Zap className="w-4 h-4 inline mr-1" />
                    +${stats.goldBonus.toFixed(0)} Gold Bonus
                  </p>
                )}
              </div>
              <DollarSign className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>

          {/* Lifetime Earnings */}
          <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-br ${darkMode ? 'from-green-900 to-green-800' : 'from-green-50 to-green-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Lifetime Earnings</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-green-100' : 'text-green-900'}`}>
                  ${stats.lifetimeEarnings.toFixed(0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.paidCount} orders completed
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
          <div className="flex space-x-2">
            {[
              { key: 'pending', label: 'Pending', count: stats.pendingCount, color: 'blue' },
              { key: 'submitted', label: 'Submitted', count: stats.submittedCount, color: 'orange' },
              { key: 'paid', label: 'Paid', count: stats.paidCount, color: 'green' }
            ].map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? `bg-${color}-600 text-black shadow-lg`
                    : darkMode 
                      ? `bg-${color}-900 text-${color}-300 hover:bg-${color}-800`
                      : `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`
                }`}
              >
                <span>{label}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === key 
                    ? 'bg-white bg-opacity-25' 
                    : darkMode
                      ? `bg-${color}-800`
                      : `bg-${color}-200`
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {getOrdersForTab(activeTab).length === 0 ? (
            <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-8 text-center`}>
              <Package className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>No orders found</h3>
              <p className={themeClasses.textSecondary}>
                {activeTab === 'pending' && "No pending orders assigned yet."}
                {activeTab === 'submitted' && "No orders submitted for review."}
                {activeTab === 'paid' && "No completed orders paid yet."}
              </p>
            </div>
          ) : (
            getOrdersForTab(activeTab).map((order) => (
              <OrderCard 
                key={order.orderId} 
                order={order} 
                activeTab={activeTab}
                onOrderClick={handleOrderClick}
                darkMode={darkMode}
                themeClasses={themeClasses}
              />
            ))
          )}
        </div>
      </div>

      {/* Task Drawer */}
      <TaskDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={selectedOrder}
        onStartTask={handleStartTask}
        onSubmitTask={handleSubmitTask}
        onSubmitOrder={handleSubmitOrder}
        darkMode={darkMode}
        themeClasses={themeClasses}
      />
    </div>
  );
};

const OrderCard = ({ order, activeTab, onOrderClick, darkMode, themeClasses }) => {
  const getStatusBadge = () => {
    if (order.status === 'completed') return 'bg-green-100 text-green-800';
    if (order.status === 'submitted') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = () => {
    if (order.status === 'completed') return 'Paid';
    if (order.status === 'submitted') return 'Submitted';
    return 'Pending';
  };

  const getPriorityBadge = () => {
    if (order.priority === 'urgent') return 'bg-red-100 text-red-800';
    if (order.priority === 'high') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const isOverdue = () => {
    const dueDate = new Date(order.dueDate);
    const now = new Date();
    return now > dueDate && order.status === 'pending';
  };

  return (
    <div 
      className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}
      onClick={() => onOrderClick(order)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-1`}>
                Order #{order.orderId}
                {isOverdue() && <span className="ml-2 text-red-500 text-sm">⚠️ Overdue</span>}
              </h3>
              <p className={`${themeClasses.textSecondary} text-sm`}>
                Customer: {order.customerName}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge()}`}>
                {order.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Package className={`w-4 h-4 ${themeClasses.textMuted}`} />
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Tasks</p>
                <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                  {order.taskCount} paintings
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className={`w-4 h-4 ${themeClasses.textMuted}`} />
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Total Payout</p>
                <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                  ${order.totalPayout}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${themeClasses.textMuted}`} />
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Due Date</p>
                <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                  {new Date(order.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <ChevronRight className={`w-5 h-5 ${themeClasses.textMuted}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskDrawer = ({ isOpen, onClose, order, onStartTask, onSubmitTask, onSubmitOrder, darkMode, themeClasses }) => {
  if (!isOpen || !order) return null;

  const allTasksCompleted = order.tasks.every(task => task.status === 'submitted' || task.status === 'completed');
  const canSubmitOrder = order.tasks.some(task => task.status === 'in_progress') && allTasksCompleted;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl ${themeClasses.cardBg} shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${themeClasses.textPrimary}`}>
                Order #{order.orderId}
              </h2>
              <p className={`${themeClasses.textSecondary} mt-1`}>
                {order.customerName} • {order.taskCount} tasks • ${order.totalPayout} total
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${themeClasses.textMuted}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Order Summary */}
          <div className={`${themeClasses.border} border rounded-lg p-4 mb-6`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Due Date</p>
                <p className={`font-medium ${themeClasses.textPrimary}`}>
                  {new Date(order.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Priority</p>
                <p className={`font-medium ${themeClasses.textPrimary} capitalize`}>
                  {order.priority}
                </p>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4 mb-6">
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
              Tasks ({order.taskCount})
            </h3>
            
            {order.tasks.map((task, index) => (
              <div key={task.taskId} className={`${themeClasses.border} border rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-1`}>
                      Task #{index + 1}: {task.title}
                    </h4>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Palette className={`w-4 h-4 ${themeClasses.textMuted}`} />
                        <span className={themeClasses.textSecondary}>{task.paintingStyle}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className={`w-4 h-4 ${themeClasses.textMuted}`} />
                        <span className={`font-medium ${themeClasses.textPrimary}`}>${task.payRate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? 'Completed' :
                       task.status === 'submitted' ? 'Submitted' :
                       task.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => onStartTask(task.taskId)}
                      className="btn btn-primary text-sm px-3 py-1"
                    >
                      Start Work
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => onSubmitTask(task.taskId)}
                      className="btn btn-success text-sm px-3 py-1"
                    >
                      Submit Task
                    </button>
                  )}
                  
                  <button className="btn btn-secondary text-sm px-3 py-1">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Order Button */}
          {canSubmitOrder && (
            <div className={`${themeClasses.border} border rounded-lg p-4 bg-green-50`}>
              <div className="text-center">
                <h4 className="font-medium text-green-800 mb-2">
                  🎉 Ready to Submit Order!
                </h4>
                <p className="text-sm text-green-600 mb-4">
                  All tasks completed. Submit the entire order for review.
                </p>
                <button
                  onClick={() => onSubmitOrder(order.orderId)}
                  className="btn bg-green-600 text-white hover:bg-green-700 px-6 py-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Complete Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ArtistPortal;
