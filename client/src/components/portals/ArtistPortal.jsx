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
  Zap
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ArtistPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Pay Period: {currentPeriod.start.toLocaleDateString()} - {currentPeriod.end.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Artist Status Card */}
      <div className="card p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isGoldStatus ? 'bg-yellow-100' : 'bg-gray-200'}`}>
              {isGoldStatus ? (
                <Crown className="w-8 h-8 text-yellow-600" />
              ) : (
                <Star className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isGoldStatus ? 'text-yellow-600' : 'text-gray-700'}`}>
                {isGoldStatus ? '👑 GOLD ARTIST' : '🥈 SILVER ARTIST'}
              </h2>
              <p className="text-gray-600">
                {onTimePercentage}% On-Time This Period
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${isGoldStatus ? 'text-yellow-600' : 'text-gray-600'}`}>
              {onTimePercentage}%
            </div>
            <div className="text-sm text-gray-500">
              {isGoldStatus ? '+20% Bonus Eligible' : `${80 - onTimePercentage}% to Gold`}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Silver (0%)</span>
            <span>Gold (80%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isGoldStatus ? 'bg-yellow-500' : 'bg-gray-400'
              }`}
              style={{ width: `${Math.min(onTimePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">This Pay Period</p>
              <p className="text-2xl font-bold text-blue-900">
                ${thisPeriodsEarnings.toFixed(0)}
              </p>
              {goldBonus > 0 && (
                <p className="text-sm text-yellow-600 font-medium">
                  <Zap className="w-4 h-4 inline mr-1" />
                  +${goldBonus.toFixed(0)} Gold Bonus
                </p>
              )}
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-green-900">
                ${lifetimeEarnings.toFixed(0)}
              </p>
              <p className="text-sm text-green-600">
                {tabCounts.paid} completed tasks
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-900">
                ${pendingEarnings.toFixed(0)}
              </p>
              <p className="text-sm text-orange-600">
                {tabCounts.submitted} tasks submitted
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="card p-4">
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
                  ? `bg-${color}-600 text-white shadow-lg`
                  : `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`
              }`}
            >
              <span>{label}</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === key 
                  ? 'bg-white bg-opacity-25' 
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
          <div className="card p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, activeTab, onSubmit, submitting }) => {
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
    <div className={`card p-6 hover:shadow-lg transition-shadow ${isOverdue() ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {task.title}
                {isOverdue() && <span className="ml-2 text-red-500 text-sm">⚠️ Overdue</span>}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
            <p className="text-gray-700 mb-4">{task.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Pay Rate</p>
                <p className="text-sm font-medium text-gray-900">
                  ${task.payRate}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium capitalize ${
                task.priority === 'urgent' ? 'text-danger-600' :
                task.priority === 'high' ? 'text-warning-600' : 'text-gray-900'
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
