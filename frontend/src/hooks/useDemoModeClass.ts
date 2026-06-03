import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyDemoModeClass, enableDemoModeFromSearch, isDemoModeEnabled } from "@/lib/demoMode";

export function useDemoModeClass() {
  const location = useLocation();

  useEffect(() => {
    const enabledByQuery = enableDemoModeFromSearch(location.search);
    applyDemoModeClass(isDemoModeEnabled(enabledByQuery));

    return () => {
      applyDemoModeClass();
    };
  }, [location.search]);
}
