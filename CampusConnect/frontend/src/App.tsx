import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Discussions } from './pages/Discussions';
import { Marketplace } from './pages/Marketplace';
import { Saved } from './pages/Saved';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

// Protected route guard
const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0B111E]">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-[#17243A] dark:border-t-slate-200 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated Application */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Discussions />} />
                <Route path="/discussions" element={<Navigate to="/" replace />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}