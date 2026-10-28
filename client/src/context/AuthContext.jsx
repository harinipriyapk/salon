import { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser } from '../services/api';
import React from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getAuthToken());
  const [user, setUserState] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUserState(res.user);
            setStoredUser(res.user);
          }
        } catch (err) {
          if (err.status === 401) {
            console.warn('Session expired or invalid, logging out.');
            setAuthToken(null);
            setStoredUser(null);
            setTokenState(null);
            setUserState(null);
          } else {
            console.warn('Could not verify session with server:', err.message);
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data.success && data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      setTokenState(data.token);
      setUserState(data.user);
    }
    return data;
  };

  const register = async ({ name, email, password, phone, role }) => {
    const data = await api.register({ name, email, password, phone, role });
    if (data.success && data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      setTokenState(data.token);
      setUserState(data.user);
    }
    return data;
  };

  const logout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setTokenState(null);
    setUserState(null);
  };

  // 1-Click Demo Login
  const demoLogin = async (role = 'customer') => {
    if (role === 'admin') {
      return login('admin@velvetvine.com', 'AdminPass123!');
    }
    return login('alice@example.com', 'AlicePass123!');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

