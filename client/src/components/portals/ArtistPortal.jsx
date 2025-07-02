import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Eye,
  Star
} from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ArtistPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['artist-tasks', activeTab],
    queryFn: () => tasksAPI.getArtistTasks({ 
      status: getStatusForTab(activeTab)
    })
  });

  const submitTaskMutation = useMutation({
    mutationFn: tasksAPI.submitTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['artist-tasks']);
    }
  });

  const tasks = tasksData?.data?.tasks || [];
  const stats = tasksData?.data?.stats || {};

  // Map tabs to actual task statuses
  function getStatusForTab(tab) {
    switch(tab) {
      case 'pending': return ['pending', 'assigned', 'in_progress'];
      case 'submitted': return ['submitted'];
      case 'paid': return ['completed'];
      default: return [];
    }
  }

  const calculateEarnings = () => {
    const paidTasks = tasks.filter(t => t.status === 'completed');
    const submittedTasks = tasks.filter(t => t.status === 'submitted');
    
    const paidEarnings = paidTasks.reduce((sum, task) => sum + task.payRate, 0);
    const pendingEarnings = submittedTasks.reduce((sum, task) => sum + task.payRate, 0);
    
    return { paidEarnings, pendingEarnings };
  };

  const { paidEarnings, pendingEarnings } = calculateEarnings();

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 
            {user?.artistInfo?.isGoldArtist && (
              <Star className="inline w-6 h-6 text-yellow-500 ml-2" />
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.artistInfo?.isGoldArtist ? 'Gold Artist' : 'Artist'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.pending || 0) + (stats.assigned || 0) + (stats.in_progress || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted || 0}</p>
              <p className="text-xs text-gray-500">
                ${pendingEarnings.toFixed(0)} pending
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${paidEarnings.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">
                {stats.completed || 0} completed tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-4">
        <div className="flex space-x-1">
          {[
            { key: 'pending', label: 'Pending', count: (stats.pending || 0) + (stats.assigned || 0) + (stats.in_progress || 0) },
            { key: 'submitted', label: 'Submitted', count: stats.submitted || 0 },
            { key: 'paid', label: 'Paid', count: stats.completed || 0 }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
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
          tasks.map((task) => (
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

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {task.title}
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
