import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Navigation from "./Navigation";
import { ClientDashboard } from "../client/ClientDashboard";
import { PhotoGallery } from "../client/PhotoGallery";
import { Viewer3D } from "../client/Viewer3D";
import { Documents } from "../client/Documents";
import { Calculator } from "../client/Calculator";
import { ClientProfile } from "../client/ClientProfile";
import { MessagesPage } from "../client/MessagesPage";

function useClientLinks() {
  const { t } = useTranslation();
  return [
    { to: "dashboard", label: t('nav.dashboard') },
    { to: "gallery", label: t('nav.gallery') },
    { to: "3d", label: t('nav.scans') },
    { to: "messages", label: t('nav.messages') },
    { to: "documents", label: t('nav.documents') },
    { to: "calculator", label: t('nav.calculator') },
  ];
}

export function ClientNavigation() {
  const clientLinks = useClientLinks();

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