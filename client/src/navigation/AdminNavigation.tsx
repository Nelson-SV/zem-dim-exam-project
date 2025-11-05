import { Navigate, Route, Routes } from "react-router-dom";
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

export function AdminNavigation() {
  return (
    <>
      <Navigation role="admin" links={adminLinks} />
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetails projectId="1" onBack={() => { <Navigate to="projects" replace /> }} />} />
        <Route path="clients" element={<ClientManagementPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </>
  );
}