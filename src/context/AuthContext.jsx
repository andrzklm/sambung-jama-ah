import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest, setAuthToken } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const res = await apiRequest('/auth/me');
        if (active) {
          setAuthToken(res.token);
          setUser(res.user);
        }
      } catch {
        if (active) {
          setAuthToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Tetap bersihkan state lokal meskipun jaringan bermasalah
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const updateCurrentUser = useCallback((updatedUser, token) => {
    if (token) {
      setAuthToken(token);
    }
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return ctx;
}
