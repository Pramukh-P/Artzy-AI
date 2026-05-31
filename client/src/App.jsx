import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar, RenderLoader } from './components';
import ProtectedRoute from './components/ProtectedRoute';
import { Home, CreatePost, MyCreations, Login, Signup, ForgotPassword, AuthCallback } from './pages';
import useServerHealth from './hooks/useServerHealth';
import { PromptBotProvider } from './context/PromptBotContext';

const AppShell = () => {
  const serverStatus = useServerHealth();

  // 'pending': waiting for first health response — show nothing (prevents flash)
  // 'cold': server is sleeping — show loader
  // 'ready': server is up — show app
  if (serverStatus === 'pending') {
    // Blank screen for up to 4s (fast on warm server, user sees nothing before loader)
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(135deg,#0f1117,#1a1a2e)',
      }} />
    );
  }

  if (serverStatus === 'cold') {
    return <RenderLoader />;
  }

  // Server is ready — show the full app
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
      <PromptBotProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </PromptBotProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
