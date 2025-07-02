import React from 'react';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  // Initialize auth state on component mount
  React.useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('User restored from localStorage:', userData);
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      const response = await fetch('https://riverry-workflow-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        const userData = data.data.user;
        const token = data.data.token;
        
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('User logged in:', userData);
        return { success: true, user: userData };
      } else {
        console.log('Login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out');
  };
  
  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };
  
  const value = {
    user: user,
    login: login,
    logout: logout,
    hasRole: hasRole,
    loading: loading
  };
  
  return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
