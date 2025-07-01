import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.role === ROLES.ARTIST) {
      navigate('/artist');
    }
  }, [user, navigate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your workflow today.
        </p>
      </div>

      <div className="card p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to Riverry Workflow
        </h3>
        <p className="text-gray-600 mb-6">
          Your role: <span className="capitalize font-medium">{user?.role?.replace('_', ' ')}</span>
        </p>
        <p className="text-sm text-gray-500">
          Your dashboard content will be available soon.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
