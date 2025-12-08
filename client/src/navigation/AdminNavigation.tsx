import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
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

const adminLinks = [
  { to: "dashboard", label: "Dashboard" },
  { to: "projects", label: "Projects" },
  { to: "clients", label: "Clients" },
  { to: "messages", label: "Messages" },
  { to: "documents", label: "Documents" },
  { to: "settings", label: "Settings" },
];

function ProjectDetailsWrapper() {
  const navigate = useNavigate();
  const { id } = useParams();
  return <ProjectDetails projectId={id ?? ""} onBack={() => navigate("/admin/projects")} />;
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
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </>
  );
}
