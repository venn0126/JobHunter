import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createDemoModeSearch, isDemoResetSearch } from "@/lib/demoMode";
import { resetDemoWorkspace } from "@/services/demoResetService";

let isHandlingDemoResetQuery = false;

export function useDemoResetFromQuery() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDemoResetSearch(location.search) || isHandlingDemoResetQuery) {
      return;
    }

    isHandlingDemoResetQuery = true;
    try {
      resetDemoWorkspace();
      navigate({ pathname: "/", search: createDemoModeSearch(location.search) }, { replace: true });
    } finally {
      window.setTimeout(() => {
        isHandlingDemoResetQuery = false;
      }, 0);
    }
  }, [location.search, navigate]);
}
