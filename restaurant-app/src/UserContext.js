import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Loo kasutaja kontekst
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(null); 

  // Kasutaja andmete värskendamine pärast lehe laadimist
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token'); t
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
  
        // Kui päring ebaõnnestub (näiteks token on aegunud või vale)
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Token expired or invalid. Logging out...');
            logout(); // Logime välja
          } else {
            console.error('Failed to fetch user data:', response.statusText); 
          }
          return;
        }
  
        // Kui päring õnnestub, salvestame kasutaja andmed
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true); // Kasutaja on autentitud
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    } else {
      setIsAuthenticated(false); 
    }
  }, []); // Kõigepealt käivitatakse ainult üks kord, kui komponent renderdatakse

  // Sisselogimise funktsioon, salvestab tokeni lokaalsetesse andmetesse ja määrab kasutaja
  const login = (token) => {
    localStorage.setItem('token', token); 
    const userData = jwtDecode(token); 
    setUser(userData); 
    setIsAuthenticated(true); 
  };

  // Väljalogimise funktsioon, eemaldab tokeni ja määrab kasutaja tühjaks
  const logout = () => {
    localStorage.removeItem('token'); 
    setUser(null); 
    setIsAuthenticated(false); 
  };

  useEffect(() => {
    refreshUser(); 
  }, [refreshUser]); 

  // Kontrollime, kas kasutaja on admin
  const isAdmin = user && user.role === 'admin'; 

  return (
    <UserContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, refreshUser }}>
      {children} {/* Tagastame kõik lapsed, mis kasutavad UserContext'i */}
    </UserContext.Provider>
  );
};
