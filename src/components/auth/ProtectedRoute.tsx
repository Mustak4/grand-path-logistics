import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowRoles?: Array<"dispecer" | "vozac">;
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowRoles }) => {
  const { user, loading, profile } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/najava" replace />;
  
  if (allowRoles && profile && !allowRoles.includes(profile.uloga as any)) {
    // Wrong role -> send to appropriate dashboard
    if (profile.uloga === "vozac") {
      return <Navigate to="/vozac" replace />;
    } else if (profile.uloga === "dispecer") {
      return <Navigate to="/dispecer" replace />;
    } else {
      return <Navigate to="/najava" replace />;
    }
  }
  
  return <>{children}</>;
};
