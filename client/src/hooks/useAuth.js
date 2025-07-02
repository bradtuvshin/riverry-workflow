import React from 'react';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
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
      
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Don't auto-redirect for now - let the app handle routing
        return { success: true, user: data.data.user };
      } else {
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
  return React.useContext(AuthContext);
}
