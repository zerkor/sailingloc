import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);
const demoUsers = {
  admin: { firstName: 'Admin', lastName: 'SailingLoc', email: 'admin@sailingloc.fr', role: 'admin' },
  owner: { firstName: 'Pierre', lastName: 'Dupont', email: 'owner1@sailingloc.fr', role: 'owner' },
  tenant: { firstName: 'Jean', lastName: 'Martin', email: 'tenant1@sailingloc.fr', role: 'tenant' },
};
const isLocalDemoHost = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isLocalDemoHost()) {
        const demoRole = new URLSearchParams(window.location.search).get('demoRole');
        if (demoUsers[demoRole]) {
          setUser(demoUsers[demoRole]);
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await getMe();
          setUser(data);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
