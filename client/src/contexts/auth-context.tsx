'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { MeResponse } from '@/lib/api';
import { ApiError, loginRequest, meRequest, registerRequest } from '@/lib/api';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth-storage';

type AuthState = {
  token: string | null;
  user: MeResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function readToken(): string | null {
  return typeof window !== 'undefined' ? getStoredToken() : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    if (!t) {
      setToken(null);
      setUser(null);
      return;
    }
    setToken(t);
    try {
      const me = await meRequest(t);
      setUser(me);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshUser();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await loginRequest(email, password);
    setStoredToken(access_token);
    setToken(access_token);
    const me = await meRequest(access_token);
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { access_token } = await registerRequest(email, password);
    setStoredToken(access_token);
    setToken(access_token);
    const me = await meRequest(access_token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [token, user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
