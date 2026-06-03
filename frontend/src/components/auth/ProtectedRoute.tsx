import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isDemoResetSearch } from "@/lib/demoMode";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  const allowDemoReset = isDemoResetSearch(location.search);

  if (!isAuthenticated && !allowDemoReset) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
