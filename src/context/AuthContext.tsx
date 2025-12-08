// app/context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { SignInResponse } from '../api/auth';
import { signInApi, validateEmailApi, verifyOtpApi } from '../api/auth';
import { setCredentials } from '../store/authSlice';

type User = { token: string; name?: string } | null;
type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const name = await AsyncStorage.getItem('name');
        if (token) setUser({ token, name: name ?? undefined });
      } catch (e) {
        console.warn('Restore token failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res: SignInResponse = await signInApi(email, password);
    await handleLoginSuccess(res);
  };

  const verifyEmail = async (email: string) => {
    await validateEmailApi(email);
  };

  const loginWithOtp = async (email: string, otp: string) => {
    const res = await verifyOtpApi(email, otp);
    await handleLoginSuccess(res);
  };

  const handleLoginSuccess = async (res: SignInResponse) => {
    if (res.token) await AsyncStorage.setItem('token', res.token);
    if (res.name) await AsyncStorage.setItem('name', res.name);

    // Dispatch to Redux if we have the ID
    if (res.clientOrDriverID) {
      dispatch(setCredentials({
        clientOrDriverID: res.clientOrDriverID,
        token: res.token,
        name: res.name
      }));
    }

    // Update local state
    setUser({ token: res.token || '', name: res.name });
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('name');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, verifyEmail, loginWithOtp, signOut }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
