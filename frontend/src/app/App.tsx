import { Navigate, Route, Routes } from "react-router-dom";
import { AppProviders } from "@/app/AppProviders";
import { primaryNavItems } from "@/app/routes";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";

export function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {primaryNavItems
            .filter((item) => item.path !== "/")
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
