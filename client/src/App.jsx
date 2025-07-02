import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import Login from './Login';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Login />
      </div>
    </AuthProvider>
  );
}

export default App;
