import { Navigate, Route, Routes } from "react-router-dom";
import { AppProviders } from "@/app/AppProviders";
import { primaryNavItems } from "@/app/routes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthPage } from "@/pages/AuthPage";
import { CareerVaultPage } from "@/pages/CareerVaultPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { JobDecisionPage } from "@/pages/JobDecisionPage";
import { JobsPage } from "@/pages/JobsPage";
import { OpportunityPage } from "@/pages/OpportunityPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="opportunity" element={<OpportunityPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobId" element={<JobDecisionPage />} />
          <Route path="resume" element={<CareerVaultPage />} />
          {primaryNavItems
            .filter((item) => !["/", "/opportunity", "/jobs", "/resume"].includes(item.path))
            .map((item) => (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<PlaceholderPage title={item.label} description={item.description} />}
              />
            ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProviders>
  );
}
