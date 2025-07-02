import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.location.reload(); // Simple refresh to trigger route change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      // Navigate based on role
      if (result.user.role === 'artist') {
        navigateTo('/artist');
      } else if (result.user.role === 'master') {
        navigateTo('/master');
      } else {
        navigateTo('/admin');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    
    const demoCredentials = {
      artist: { email: 'artist@riverry.com', password: 'demo123' },
      admin: { email: 'admin@riverry.com', password: 'demo123' },
      master: { email: 'master@riverry.com', password: 'demo123' }
    };

    const result = await login(demoCredentials[role]);
    
    if (result.success) {
      if (role === 'artist') {
        navigateTo('/artist');
      } else if (role === 'master') {
        navigateTo('/master');
      } else {
        navigateTo('/admin');
      }
    } else {
      setError('Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Riverry
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your workflow account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => handleDemoLogin('artist')}
              disabled={loading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Artist Demo'}
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Admin Demo'}
            </button>
            <button
              onClick={() => handleDemoLogin('master')}
              disabled={loading}
              className="w-full inline-flex justify-center py-3 px-4 border border-purple-300 rounded-lg bg-purple-50 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : '👑 Master Demo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
