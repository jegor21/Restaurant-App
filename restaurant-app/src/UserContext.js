import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Token expired or invalid. Logging out...');
            logout();
          } else {
            console.error('Failed to fetch user data:', response.statusText);
          }
          return;
        }
  
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error refreshing user data:', error);
        
      }
    } else {
      setIsAuthenticated(false);
    }
  },  []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const userData = jwtDecode(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    refreshUser(); // Refresh user data on app load
  }, [refreshUser]); // Run only once when the component mounts

  const isAdmin = user && user.role === 'admin';

  return (
    <UserContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};