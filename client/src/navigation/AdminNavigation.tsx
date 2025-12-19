import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Navigation from "./Navigation";
import { AdminDashboard } from "../admin/AdminDashboard";
import { AdminProjectsList } from "../admin/AdminProjectsList";
import { ProjectDetails } from "../admin/ProjectDetails";
import { ClientManagementPage } from "../admin/client-management/ClientManagementPage";
import { AdminDocuments } from "../admin/AdminDocuments.tsx";
import { AdminSettings } from "../admin/AdminSettings";
import { Profile } from "../admin/Profile";
import { MessagesPage } from "../client/MessagesPage";
import { useParams } from "react-router-dom";

function useAdminLinks() {
  const { t } = useTranslation();
  return [
    { to: "dashboard", label: t('nav.dashboard') },
    { to: "projects", label: t('nav.projects') },
    { to: "clients", label: t('nav.clients') },
    { to: "messages", label: t('nav.messages') },
    { to: "documents", label: t('nav.documents') },
    { to: "settings", label: t('nav.settings') },
  ];
}

function ProjectDetailsWrapper() {
  const navigate = useNavigate();
  const { id } = useParams();
  return <ProjectDetails projectId={id ?? ""} onBack={() => navigate("/admin/projects")} />;
}

export function AdminNavigation() {
  const navigate = useNavigate();
  const adminLinks = useAdminLinks();

  const handleViewProject = (projectId: string) => {
    navigate(`/admin/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation role="admin" links={adminLinks} />
      <main className="container mx-auto px-4 pb-10 md:px-6">
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard onViewProject={handleViewProject} />} />
          <Route path="projects" element={<AdminProjectsList onViewProject={handleViewProject} />} />
          <Route path="projects/:id" element={<ProjectDetailsWrapper />} />
          <Route path="clients" element={<ClientManagementPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}
