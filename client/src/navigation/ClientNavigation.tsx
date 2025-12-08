import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./Navigation";
import { ClientDashboard } from "../client/ClientDashboard";
import { PhotoGallery } from "../client/PhotoGallery";
import { Viewer3D } from "../client/Viewer3D";
import { Documents } from "../client/Documents";
import { Calculator } from "../client/Calculator";
import { ClientProfile } from "../client/ClientProfile";
import { MessagesPage } from "../client/MessagesPage";

const clientLinks = [
  { to: "dashboard", label: "Dashboard" },
  { to: "gallery", label: "Gallery" },
  { to: "3d", label: "Scans" },
  { to: "messages", label: "Messages" },
  { to: "documents", label: "Documents" },
  { to: "calculator", label: "Calculator" },
];

export function ClientNavigation() {
  return (
    <>
      <Navigation role="client" links={clientLinks} />
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="gallery" element={<PhotoGallery />} />
        <Route path="3d" element={<Viewer3D />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="documents" element={<Documents />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="profile" element={<ClientProfile />} />
      </Routes>
    </>
  );
}