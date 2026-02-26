import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import HomePage from './pages/articles/HomePage.jsx';
import ArticleDetailPage from './pages/articles/ArticleDetailPage.jsx';
import ArticleEditorPage from './pages/articles/ArticleEditorPage.jsx';
import DashboardPage from './pages/articles/DashboardPage.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route
          path="/articles/new"
          element={
            <ProtectedRoute>
              <ArticleEditorPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id/edit"
          element={
            <ProtectedRoute>
              <ArticleEditorPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

