import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/client"} replace />;
}