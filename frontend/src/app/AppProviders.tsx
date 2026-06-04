import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { useDemoModeClass } from "@/hooks/useDemoModeClass";
import { useDemoResetFromQuery } from "@/hooks/useDemoResetFromQuery";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRuntimeEffects />
        {children}
        <ToastViewport />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function AppRuntimeEffects() {
  useDemoModeClass();
  useDemoResetFromQuery();
  return null;
}
