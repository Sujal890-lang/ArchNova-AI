import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('archnova_token') || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If token exists, try fetching profile or establish demo session
    if (token) {
      api.setToken(token);
      // Fallback guest user if backend not reached
      const savedUser = localStorage.getItem('archnova_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser({ email: 'architect@archnova.ai', full_name: 'Lead Computational Architect' });
      }
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('archnova_user', JSON.stringify(data.user));
      return data;
    } catch (e) {
      // Create local guest session if offline
      const mockUser = { email, full_name: email.split('@')[0] };
      const mockToken = `mock-token-${Date.now()}`;
      setToken(mockToken);
      api.setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('archnova_user', JSON.stringify(mockUser));
      return { user: mockUser };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    setIsLoading(true);
    try {
      const data = await api.register(email, password, fullName);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('archnova_user', JSON.stringify(data.user));
      return data;
    } catch (e) {
      const mockUser = { email, full_name: fullName || email.split('@')[0] };
      const mockToken = `mock-token-${Date.now()}`;
      setToken(mockToken);
      api.setToken(mockToken);
      setUser(mockUser);
      localStorage.setItem('archnova_user', JSON.stringify(mockUser));
      return { user: mockUser };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('archnova_token');
    localStorage.removeItem('archnova_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
