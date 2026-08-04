import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('typerush_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.admin) {
          setAdmin(res.admin);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('[Auth Session Warning]: Token verification failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.token) {
        localStorage.setItem('typerush_admin_token', res.token);
        setToken(res.token);
        setAdmin(res.admin);
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('typerush_admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!token && !!admin, login, logout, loading }}>
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
