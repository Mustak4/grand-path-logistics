import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowRoles?: Array<"dispecer" | "vozac">;
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowRoles }) => {
  const { user, loading, profile } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/najava" replace />;
  if (allowRoles && profile && !allowRoles.includes(profile.uloga as any)) {
    // Wrong role -> send to home
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
