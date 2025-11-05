import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { ClientDashboard } from './client/ClientDashboard';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Navigation } from './navigation/Navigation';
import { Calculator } from './client/Calculator';
import { ProjectDetails } from './admin/ProjectDetails';
import { AdminProjectsList } from './admin/AdminProjectsList';
import { ClientManagement } from './admin/ClientManagement';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminSettings } from './admin/AdminSettings';
import { AdminDashboard } from './admin/AdminDashboard';
import { PhotoGallery } from './client/PhotoGallery';
import { Viewer3D } from './client/Viewer3D';
import { Documents } from './client/Documents';
import { MessagesPage } from './client/MessagesPage';

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/client'} replace />;
}

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'UA' | 'EN'>('UA');

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reset active tab when switching routes
  useEffect(() => {
    setActiveTab('dashboard');
    setSelectedProjectId(null);
  }, [user?.role]);

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackFromProject = () => {
    setSelectedProjectId(null);
  };

  const renderContent = () => {
    if (!user) return null;

    if (user.role === 'admin') {
      // Show project details if a project is selected
      if (selectedProjectId) {
        return <ProjectDetails projectId={selectedProjectId} onBack={handleBackFromProject} />;
      }

      switch (activeTab) {
        case 'projects':
          return <AdminProjectsList onViewProject={handleViewProject} />;
        case 'clients':
          return <ClientManagement />;
        case 'messages':
          return <MessagesPage />;
        case 'analytics':
          return <AdminAnalytics />;
        case 'settings':
          return <AdminSettings />;
        case 'dashboard':
        default:
          return <AdminDashboard onViewProject={handleViewProject} />;
      }
    } else {
      switch (activeTab) {
        case 'gallery':
          return <PhotoGallery />;
        case '3d':
          return <Viewer3D />;
        case 'messages':
          return <MessagesPage />;
        case 'documents':
          return <Documents />;
        case 'calculator':
          return <Calculator />;
        case 'dashboard':
        default:
          return <ClientDashboard />;
      }
    }
  };

  return (
      <>
        {user && (
            <Navigation
                userRole={user.role === 'admin' ? 'admin' : 'client'}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                darkMode={darkMode}
                onDarkModeToggle={() => setDarkMode(!darkMode)}
                language={language}
                onLanguageChange={setLanguage}
            />
        )}

        <main className="container mx-auto px-4 py-8">
          {renderContent()}
        </main>

        {/* Logout Button - Only show when logged in */}
        {user && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                  onClick={logout}
                  variant="destructive"
                  className="shadow-lg"
              >
                Logout
              </Button>
            </div>
        )}

        <Toaster />
      </>
  );
}

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AppContent />
                    </ProtectedRoute>
                  }
              />

              {/* Protected Client Routes */}
              <Route
                  path="/client/*"
                  element={
                    <ProtectedRoute requiredRole="client">
                      <AppContent />
                    </ProtectedRoute>
                  }
              />

              {/* Default redirect based on user role */}
              <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <RoleRedirect />
                    </ProtectedRoute>
                  }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;