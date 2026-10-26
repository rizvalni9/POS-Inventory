import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient, { setAccessToken, clearAccessToken } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize session on page load / browser refresh
  const initializeAuth = useCallback(async () => {
    try {
      // Attempt silent refresh using HttpOnly cookie
      const res = await apiClient.post('/auth/refresh');
      if (res.data?.success && res.data?.data) {
        setAccessToken(res.data.data.token);
        setUser(res.data.data.user);
      }
    } catch (err) {
      // Unauthenticated or expired session on initial load is expected
      clearAccessToken();
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Listen for session expiry event dispatched by Axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      clearAccessToken();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [initializeAuth]);

  // Login handler
  const login = async (username, password) => {
    const res = await apiClient.post('/auth/login', { username, password });
    if (res.data?.success && res.data?.data) {
      setAccessToken(res.data.data.token);
      setUser(res.data.data.user);
    }
    return res.data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  // Check if current user has one of the allowed roles
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (!Array.isArray(allowedRoles)) return user.role === allowedRoles;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    logout,
    hasRole,
    refreshSession: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
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
