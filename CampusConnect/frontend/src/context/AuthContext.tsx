import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, University } from '../types';
import { authService } from '../services/api';
import { INITIAL_USER } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  selectedUniversity: University;
  setSelectedUniversity: (uni: University) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    university: Exclude<University, 'All'>;
    batch: string;
    whatsapp: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [token, setToken] = useState<string | null>('mock_jwt_token_campuscrew_demo');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<University>('All');

  useEffect(() => {
    async function loadAuth() {
      try {
        const { user: storedUser, token: storedToken } = await authService.getCurrentUser();
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
        } else {
          // Keep initial student for instant usable experience or unauthenticated
          setUser(INITIAL_USER);
          setToken('mock_jwt_token_campuscrew_demo');
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, pass);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    university: Exclude<University, 'All'>;
    batch: string;
    whatsapp: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setToken(res.token);
      setSelectedUniversity(res.user.university);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const setDemoUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('campuscrew_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        selectedUniversity,
        setSelectedUniversity,
        login,
        register,
        logout,
        setDemoUser,
      }}
    >
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
