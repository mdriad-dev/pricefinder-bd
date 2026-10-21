import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, fullName: string, phoneNumber?: string, role?: string) => Promise<void>;
  logout: () => void;
  isShopkeeper: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isShopkeeper: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const resp = await api.login(email);
      setToken(resp.access_token);
      setUser(resp.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, fullName: string, phoneNumber?: string, role: string = 'consumer') => {
    setIsLoading(true);
    try {
      const resp = await api.register(email, fullName, phoneNumber, role);
      setToken(resp.access_token);
      setUser(resp.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isShopkeeper = user?.role === 'shopkeeper' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isShopkeeper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
