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

function useClientLinks(includeProfile = false) {
  const { t } = useTranslation();
  const links = [
    { to: "dashboard", label: t('nav.dashboard') },
    { to: "gallery", label: t('nav.gallery') },
    { to: "3d", label: t('nav.scans') },
    { to: "messages", label: t('nav.messages') },
    { to: "documents", label: t('nav.documents') },
    { to: "calculator", label: t('nav.calculator') },
  ];

  if (includeProfile) {
    links.push({ to: "profile", label: t('nav.profile') });
  }

  return links;
}

export function ClientNavigation() {
  const clientLinks = useClientLinks();
  const mobileClientLinks = useClientLinks(true);

  return (
    <div className="min-h-screen bg-background">
      <Navigation role="client" links={clientLinks} mobileLinks={mobileClientLinks} />
      <main className="container mx-auto px-4 pb-10 md:px-6">
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
      </main>
    </div>
  );
}
