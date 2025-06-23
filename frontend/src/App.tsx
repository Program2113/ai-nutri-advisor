import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { AuthPage } from './pages/AuthPage';
import { MainApp } from './pages/MainApp';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white/30 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading NutriAI...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/app" replace /> : <AuthPage />} 
      />
      <Route 
        path="/app" 
        element={user ? <MainApp /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={user ? "/app" : "/auth"} replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;