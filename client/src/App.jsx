import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './Login';
import ArtistPortal from './components/portals/ArtistPortal';
import MasterPortal from './components/portals/MasterPortal';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate portal based on role
    switch(user.role) {
      case 'master':
        return <Navigate to="/master" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'editor':
        return <Navigate to="/editor" replace />;
      case 'revisor':
        return <Navigate to="/revisor" replace />;
      case 'artist':
      default:
        return <Navigate to="/artist" replace />;
    }
  }
  
  return children;
};

// Role-based Home Redirect
const RoleBasedHome = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to appropriate portal
  switch(user.role) {
    case 'master':
      return <Navigate to="/master" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'editor':
      return <Navigate to="/editor" replace />;
    case 'revisor':
      return <Navigate to="/revisor" replace />;
    case 'artist':
    default:
      return <Navigate to="/artist" replace />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Role-based Home Redirect */}
              <Route path="/" element={<RoleBasedHome />} />
              
              {/* Protected Routes */}
              <Route 
                path="/artist" 
                element={
                  <ProtectedRoute allowedRoles={['artist']}>
                    <ArtistPortal />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/master" 
                element={
                  <ProtectedRoute allowedRoles={['master']}>
                    <MasterPortal />
                  </ProtectedRoute>
                } 
              />
              
              {/* Placeholder routes for other roles */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
                      <p>Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/editor" 
                element={
                  <ProtectedRoute allowedRoles={['editor']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold mb-4">Editor Portal</h1>
                      <p>Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/revisor" 
                element={
                  <ProtectedRoute allowedRoles={['revisor']}>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold mb-4">Revisor Portal</h1>
                      <p>Coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - redirect to appropriate portal */}
              <Route path="*" element={<RoleBasedHome />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
