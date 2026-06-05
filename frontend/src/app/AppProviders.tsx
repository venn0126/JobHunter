import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { RuntimeRecoveryPanel } from "@/components/business/RuntimeRecoveryPanel";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { useDemoModeClass } from "@/hooks/useDemoModeClass";
import { useDemoResetFromQuery } from "@/hooks/useDemoResetFromQuery";
import { useRuntimeDataSync } from "@/hooks/useRuntimeDataSync";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRuntimeEffects />
        {children}
        <RuntimeRecoveryPanel />
        <ToastViewport />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function AppRuntimeEffects() {
  useDemoModeClass();
  useDemoResetFromQuery();
  useRuntimeDataSync();
  return null;
}
