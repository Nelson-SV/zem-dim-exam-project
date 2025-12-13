import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './i18n';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { RoleRedirect } from './navigation/RoleRedirect';
import { AdminNavigation } from './navigation/AdminNavigation';
import { ClientNavigation } from './navigation/ClientNavigation';
import { ResetPassword } from './client/ResetPassword';
import {Toaster} from "sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin area */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminNavigation />
              </ProtectedRoute>
            }
          />

          {/* Protected Client area */}
          <Route
            path="/client/*"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientNavigation />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
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
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;