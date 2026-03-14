
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AuthPage from './components/AuthPage';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';


const App: React.FC = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0D0E0D] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#22C55E] animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={!session ? <LandingPage /> : <Navigate to="/app" replace />}
        />
        <Route
          path="/login"
          element={!session ? <AuthPage /> : <Navigate to="/app" replace />}
        />
        <Route
          path="/signup"
          element={!session ? <SignUpPage /> : <Navigate to="/app" replace />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route
          path="/app"
          element={session ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

    </BrowserRouter>
  );
};

export default App;
