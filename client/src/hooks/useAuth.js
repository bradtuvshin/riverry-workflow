import React from 'react';

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  
  const login = () => {
    return { success: true };
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const value = {
    user: user,
    login: login,
    logout: logout,
    hasRole: () => true,
    loading: false
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
