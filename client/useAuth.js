import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);
      // Simplified login - we'll fix this later
      return { success: true, user: { email: credentials.email, role: 'artist' } };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = () => {
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
