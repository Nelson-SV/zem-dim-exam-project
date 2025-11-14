import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { AdminDashboard } from "../admin/AdminDashboard";
import { AdminProjectsList } from "../admin/AdminProjectsList";
import { ProjectDetails } from "../admin/ProjectDetails";
import { ClientManagementPage } from "../admin/client-management/ClientManagementPage";
import { AdminAnalytics } from "../admin/AdminAnalytics";
import { AdminSettings } from "../admin/AdminSettings";
import { MessagesPage } from "../client/MessagesPage";

const adminLinks = [
  { to: "dashboard", label: "Dashboard" },
  { to: "projects", label: "Projects" },
  { to: "clients", label: "Clients" },
  { to: "messages", label: "Messages" },
  { to: "analytics", label: "Analytics" },
  { to: "settings", label: "Settings" },
];

function ProjectDetailsWrapper() {
  const navigate = useNavigate();
  return <ProjectDetails projectId="1" onBack={() => navigate("/admin/projects")} />;
}

export function AdminNavigation() {
  const navigate = useNavigate();

  const handleViewProject = (projectId: string) => {
    navigate(`/admin/projects/${projectId}`);
  };

  return (
    <>
      <Navigation role="admin" links={adminLinks} />
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard onViewProject={handleViewProject} />} />
        <Route path="projects" element={<AdminProjectsList onViewProject={handleViewProject} />} />
        <Route path="projects/:id" element={<ProjectDetailsWrapper />} />
        <Route path="clients" element={<ClientManagementPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </>
  );
}