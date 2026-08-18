// client/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';

// Create context with a default value
export const AuthContext = createContext({
  user: null,
  setUser: () => {}
});

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Save to localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    login: (userData) => {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
