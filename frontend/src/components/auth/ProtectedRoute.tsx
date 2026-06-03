import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const allowDemoReset = new URLSearchParams(location.search).get("reset") === "demo";

  if (!isAuthenticated && !allowDemoReset) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
