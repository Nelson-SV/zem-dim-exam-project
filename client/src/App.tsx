import { useEffect, useState } from 'react'
import './App.css'
import { ClientDashboard } from './client/ClientDashboard';
import { Button } from "./components/ui/button";
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
import { Messages } from './client/Messages';
import { Documents } from './client/Documents';

function App() {
  
  const [userRole, setUserRole] = useState<'admin' | 'client'>('client');
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

  // Reset active tab when switching roles
  useEffect(() => {
    setActiveTab('dashboard');
    setSelectedProjectId(null);
  }, [userRole]);

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackFromProject = () => {
    setSelectedProjectId(null);
  };
  

  const renderContent = () => {
    if (userRole === 'admin') {
      // Show project details if a project is selected
      if (selectedProjectId) {
        return <ProjectDetails projectId={selectedProjectId} onBack={handleBackFromProject} />;
      }

      switch (activeTab) {
        case 'projects':
          return <AdminProjectsList onViewProject={handleViewProject} />;
        case 'clients':
          return <ClientManagement />;
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
          return <Messages />;
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
    <div className="min-h-screen bg-background">
      <Navigation
        userRole={userRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Role Switcher - For Demo Purposes */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setUserRole(userRole === 'admin' ? 'client' : 'admin')}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-full shadow-lg hover:bg-[#3B82F6]/90 transition-all hover:scale-105"
        >
          Switch to {userRole === 'admin' ? 'Client' : 'Admin'} View
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export default App
