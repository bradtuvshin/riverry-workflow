import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './Login';
import ArtistPortal from './components/portals/ArtistPortal';
import MasterPortal from './components/portals/MasterPortal';

// Simple Router Component
const SimpleRouter = () => {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for URL changes
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not logged in, show login
  if (!user) {
    return <Login />;
  }

  // Route based on current path and user role
  switch(currentPath) {
    case '/master':
      if (user.role === 'master') {
        return <MasterPortal />;
      }
      // If not master, redirect to appropriate portal
      window.location.href = user.role === 'artist' ? '/artist' : '/admin';
      return null;
      
    case '/artist':
      if (user.role === 'artist') {
        return <ArtistPortal />;
      }
      // If not artist, redirect to appropriate portal
      window.location.href = user.role === 'master' ? '/master' : '/admin';
      return null;
      
    case '/admin':
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
          <p>Coming soon...</p>
        </div>
      );
      
    default:
      // Default redirect based on user role
      if (user.role === 'master') {
        window.location.href = '/master';
      } else if (user.role === 'artist') {
        window.location.href = '/artist';
      } else {
        window.location.href = '/admin';
      }
      return null;
  }
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <SimpleRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
