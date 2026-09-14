import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UtilityBar } from './components/layout/UtilityBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { HomePage } from './pages/home/HomePage';
import { AskPage } from './pages/ask/AskPage';
import { AnswerPage } from './pages/answer/AnswerPage';
import { ClassificationPage } from './pages/classification/ClassificationPage';
import { PriorArtPage } from './pages/prior-art/PriorArtPage';
import { ABSPage } from './pages/abs/ABSPage';
import { TKPage } from './pages/tk/TKPage';
import { SourcesPage } from './pages/sources/SourcesPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { ProfileSettings } from './pages/dashboard/ProfileSettings';
import { SavedSources } from './pages/dashboard/SavedSources';
import { ExpertDashboard } from './pages/expert/ExpertDashboard';
import { ExpertCaseDetail } from './pages/expert/ExpertCaseDetail';
import { HelpPage } from './pages/help/HelpPage';
import { AboutPage, ContactPage } from './pages/static/StaticPages';
import { NotFoundPage } from './pages/static/NotFoundPage';
import { CaseBuilderPage } from './pages/case-builder/CaseBuilderPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ExpertLoginPage } from './pages/auth/ExpertLoginPage';

// Category Pages
import {
  PatentPage,
  TrademarkPage,
  GIPage,
  CopyrightPage,
  DesignPage,
  RegulatoryPage
} from './pages/categories/IPCategoryPages';

import { useAppStore } from './store/appStore';
import { supabase, isSupabaseConfigured } from './services/supabase';

export const App: React.FC = () => {
  const { setUser, setSession, setAuthInitialized } = useAppStore();

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const {
            data: { session },
            error
          } = await supabase.auth.getSession();

          if (error) {
            console.warn('[Supabase] Initial session retrieval error:', error);
          }

          if (isMounted) {
            if (session?.user) {
              const meta = session.user.user_metadata || {};
              setUser({
                id: session.user.id,
                name: meta.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: meta.role || 'user'
              });
              setSession(session);
            } else {
              setUser(null);
              setSession(null);
            }
            setAuthInitialized(true);
          }
        } catch (err) {
          console.warn('[Supabase] Auth initialization error:', err);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setAuthInitialized(true);
          }
        }

        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;
          console.log('[Supabase Auth Event]:', event);
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            setUser({
              id: session.user.id,
              name: meta.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: meta.role || 'user'
            });
            setSession(session);
          } else {
            setUser(null);
            setSession(null);
          }
          setAuthInitialized(true);
        });

        return () => {
          subscription.unsubscribe();
        };
      } else {
        if (isMounted) {
          setUser(null);
          setSession(null);
          setAuthInitialized(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, setSession, setAuthInitialized]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <UtilityBar />
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Authenticated Application Pages (Protected with Supabase Session) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ask"
              element={
                <ProtectedRoute>
                  <AskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/answer"
              element={
                <ProtectedRoute>
                  <AnswerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/case-builder"
              element={
                <ProtectedRoute>
                  <CaseBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classifier"
              element={
                <ProtectedRoute>
                  <ClassificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prior-art"
              element={
                <ProtectedRoute>
                  <PriorArtPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/abs"
              element={
                <ProtectedRoute>
                  <ABSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tk"
              element={
                <ProtectedRoute>
                  <TKPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sources"
              element={
                <ProtectedRoute>
                  <SourcesPage />
                </ProtectedRoute>
              }
            />

            {/* Category Guidance Pages (Protected) */}
            <Route
              path="/patent"
              element={
                <ProtectedRoute>
                  <PatentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trademark"
              element={
                <ProtectedRoute>
                  <TrademarkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gi"
              element={
                <ProtectedRoute>
                  <GIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/copyright"
              element={
                <ProtectedRoute>
                  <CopyrightPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/design"
              element={
                <ProtectedRoute>
                  <DesignPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/regulatory"
              element={
                <ProtectedRoute>
                  <RegulatoryPage />
                </ProtectedRoute>
              }
            />

            {/* Citizen Dashboard (Protected) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/saved-sources"
              element={
                <ProtectedRoute>
                  <SavedSources />
                </ProtectedRoute>
              }
            />

            {/* Empanelled Expert Portal (Protected with expert role) */}
            <Route
              path="/expert/dashboard"
              element={
                <ProtectedRoute requiredRole="expert">
                  <ExpertDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert/cases/:caseId"
              element={
                <ProtectedRoute requiredRole="expert">
                  <ExpertCaseDetail />
                </ProtectedRoute>
              }
            />

            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/expert/login" element={<ExpertLoginPage />} />

            {/* Static & Informational Pages */}
            <Route path="/help" element={<HelpPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
