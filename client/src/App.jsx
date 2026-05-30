import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar, RenderLoader } from './components';
import ProtectedRoute from './components/ProtectedRoute';
import { Home, CreatePost, MyCreations, Login, Signup, ForgotPassword, AuthCallback } from './pages';
import useServerHealth from './hooks/useServerHealth';

const AppShell = () => {
  const serverStatus = useServerHealth();

  if (serverStatus === 'cold') {
    return <RenderLoader />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route path="/create-post" element={
          <ProtectedRoute><CreatePost /></ProtectedRoute>
        } />
        <Route path="/my-creations" element={
          <ProtectedRoute><MyCreations /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
