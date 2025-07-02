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
  Sun
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ArtistPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [darkMode, setDarkMode] = useState(false);

  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['artist-tasks'],
    queryFn: () => tasksAPI.getArtistTasks({})
  });

  const submitTaskMutation = useMutation({
    mutationFn: tasksAPI.submitTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['artist-tasks']);
    }
  });

  const allTasks = tasksData?.data?.tasks || [];

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

  // Filter tasks by tab
  const getTasksForTab = (tab) => {
    switch(tab) {
      case 'pending': 
        return allTasks.filter(t => ['pending', 'assigned', 'in_progress'].includes(t.status));
      case 'submitted': 
        return allTasks.filter(t => t.status === 'submitted');
      case 'paid': 
        return allTasks.filter(t => t.status === 'completed');
      default: 
        return [];
    }
  };

  // Get tasks for current pay period
  const getCurrentPeriodTasks = () => {
    return allTasks.filter(task => {
      const assignedDate = new Date(task.createdAt);
      return assignedDate >= currentPeriod.start && assignedDate <= currentPeriod.end;
    });
  };

  // Calculate on-time percentage for current period
  const calculateOnTimePercentage = () => {
    const periodTasks = getCurrentPeriodTasks();
    const submittedTasks = periodTasks.filter(t => ['submitted', 'completed'].includes(t.status));
    
    if (submittedTasks.length === 0) return 0;
    
    const onTimeTasks = submittedTasks.filter(task => {
      const assignedTime = new Date(task.createdAt);
      const submittedTime = new Date(task.submittedAt || task.updatedAt);
      const hoursDiff = (submittedTime - assignedTime) / (1000 * 60 * 60);
      return hoursDiff <= 48;
    });
    
    return Math.round((onTimeTasks.length / submittedTasks.length) * 100);
  };

  // Calculate earnings
  const calculateEarnings = () => {
    const periodTasks = getCurrentPeriodTasks();
    const submittedPeriodTasks = periodTasks.filter(t => t.status === 'submitted');
    const completedPeriodTasks = periodTasks.filter(t => t.status === 'completed');
    
    const allSubmittedTasks = allTasks.filter(t => t.status === 'submitted');
    const allCompletedTasks = allTasks.filter(t => t.status === 'completed');
    
    const thisPeriodsEarnings = submittedPeriodTasks.reduce((sum, task) => sum + task.payRate, 0);
    const pendingEarnings = allSubmittedTasks.reduce((sum, task) => sum + task.payRate, 0);
    const lifetimeEarnings = allCompletedTasks.reduce((sum, task) => sum + task.payRate, 0);
    
    const onTimePercentage = calculateOnTimePercentage();
    const isGoldStatus = onTimePercentage >= 80;
    const goldBonus = isGoldStatus ? thisPeriodsEarnings * 0.2 : 0;
    
    return {
      thisPeriodsEarnings,
      pendingEarnings,
      lifetimeEarnings,
      goldBonus,
      onTimePercentage,
      isGoldStatus
    };
  };

  const {
    thisPeriodsEarnings,
    pendingEarnings,
    lifetimeEarnings,
    goldBonus,
    onTimePercentage,
    isGoldStatus
  } = calculateEarnings();

  const handleSubmitTask = async (taskId) => {
    try {
      await submitTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Submit task error:', error);
    }
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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabCounts = {
    pending: getTasksForTab('pending').length,
    submitted: getTasksForTab('submitted').length,
    paid: getTasksForTab('paid').length
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
              <div className={`p-3 rounded-full ${isGoldStatus ? 'bg-yellow-100' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {isGoldStatus ? (
                  <Crown className="w-8 h-8 text-yellow-600" />
                ) : (
                  <Star className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isGoldStatus ? 'text-yellow-600' : themeClasses.textPrimary}`}>
                  {isGoldStatus ? '👑 GOLD ARTIST' : '🥈 SILVER ARTIST'}
                </h2>
                <p className={themeClasses.textSecondary}>
                  {onTimePercentage}% On-Time This Period
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${isGoldStatus ? 'text-yellow-600' : themeClasses.textPrimary}`}>
                {onTimePercentage}%
              </div>
              <div className={`text-sm ${themeClasses.textMuted}`}>
                {isGoldStatus ? '+20% Bonus Eligible' : `${80 - onTimePercentage}% to Gold`}
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
                  isGoldStatus ? 'bg-yellow-500' : darkMode ? 'bg-gray-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(onTimePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Earnings Cards - Reordered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Earnings */}
          <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 bg-gradient-to-br ${darkMode ? 'from-orange-900 to-orange-800' : 'from-orange-50 to-orange-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Pending Payment</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-orange-100' : 'text-orange-900'}`}>
                  ${pendingEarnings.toFixed(0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {tabCounts.submitted} tasks submitted
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
                  ${thisPeriodsEarnings.toFixed(0)}
                </p>
                {goldBonus > 0 && (
                  <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>
                    <Zap className="w-4 h-4 inline mr-1" />
                    +${goldBonus.toFixed(0)} Gold Bonus
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
                  ${lifetimeEarnings.toFixed(0)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {tabCounts.paid} completed tasks
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Black Text for Active */}
        <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
          <div className="flex space-x-2">
            {[
              { key: 'pending', label: 'Pending', count: tabCounts.pending, color: 'blue' },
              { key: 'submitted', label: 'Submitted', count: tabCounts.submitted, color: 'orange' },
              { key: 'paid', label: 'Paid', count: tabCounts.paid, color: 'green' }
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

        {/* Tasks List */}
        <div className="space-y-4">
          {getTasksForTab(activeTab).length === 0 ? (
            <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-8 text-center`}>
              <Calendar className={`w-12 h-12 ${themeClasses.textMuted} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>No tasks found</h3>
              <p className={themeClasses.textSecondary}>
                {activeTab === 'pending' && "No pending tasks assigned yet."}
                {activeTab === 'submitted' && "No tasks submitted for review."}
                {activeTab === 'paid' && "No completed tasks paid yet."}
              </p>
            </div>
          ) : (
            getTasksForTab(activeTab).map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                activeTab={activeTab}
                onSubmit={handleSubmitTask}
                submitting={submitTaskMutation.isLoading}
                darkMode={darkMode}
                themeClasses={themeClasses}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, activeTab, onSubmit, submitting, darkMode, themeClasses }) => {
  const getStatusBadge = () => {
    if (task.status === 'completed') return 'badge-success';
    if (task.status === 'submitted') return 'badge-warning';
    return 'badge-gray';
  };

  const getStatusText = () => {
    if (task.status === 'completed') return 'Paid';
    if (task.status === 'submitted') return 'Submitted';
    if (task.status === 'in_progress') return 'In Progress';
    if (task.status === 'assigned') return 'Assigned';
    return 'Pending';
  };

  const canSubmit = task.status === 'in_progress' && activeTab === 'pending';

  // Calculate if task is overdue (more than 48 hours since assignment)
  const isOverdue = () => {
    if (task.status !== 'assigned' && task.status !== 'in_progress') return false;
    const assignedTime = new Date(task.createdAt);
    const now = new Date();
    const hoursDiff = (now - assignedTime) / (1000 * 60 * 60);
    return hoursDiff > 48;
  };

  return (
    <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-6 hover:shadow-lg transition-shadow ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-1`}>
                {task.title}
                {isOverdue() && <span className="ml-2 text-red-500 text-sm">⚠️ Overdue</span>}
              </h3>
              <div className={`flex items-center space-x-4 text-sm ${themeClasses.textSecondary}`}>
                <span>Task ID: {task.taskId}</span>
                <span>•</span>
                <span className="capitalize">{task.paintingStyle?.replace('_', ' ')}</span>
              </div>
            </div>
            
            <span className={`badge ${getStatusBadge()}`}>
              {getStatusText()}
            </span>
          </div>

          {task.description && (
            <p className={`${themeClasses.textSecondary} mb-4`}>{task.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${themeClasses.textMuted}`} />
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Due Date</p>
                <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className={`w-4 h-4 ${themeClasses.textMuted}`} />
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Pay Rate</p>
                <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                  ${task.payRate}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium capitalize ${
                task.priority === 'urgent' ? 'text-red-600' :
                task.priority === 'high' ? 'text-yellow-600' : themeClasses.textPrimary
              }`}>
                {task.priority} priority
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 lg:ml-6">
          <button className="btn btn-secondary inline-flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </button>
          
          {canSubmit && (
            <button
              onClick={() => onSubmit(task._id)}
              disabled={submitting}
              className="btn btn-success inline-flex items-center disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Submit Task
            </button>
          )}
          
          {task.status === 'assigned' && (
            <button
              onClick={() => {/* Handle start task */}}
              className="btn btn-primary inline-flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Start Work
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistPortal;
