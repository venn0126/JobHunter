import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createDemoModeSearch, isDemoResetSearch } from "@/lib/demoMode";
import { resetDemoWorkspace } from "@/services/demoResetService";
import { useToast } from "@/hooks/useToast";

let isHandlingDemoResetQuery = false;

export function useDemoResetFromQuery() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isDemoResetSearch(location.search) || isHandlingDemoResetQuery) {
      return;
    }

    isHandlingDemoResetQuery = true;
    try {
      const result = resetDemoWorkspace();
      showToast({ message: result.message, title: "Demo 已重置" });
      navigate({ pathname: "/", search: createDemoModeSearch(location.search) }, { replace: true });
    } finally {
      window.setTimeout(() => {
        isHandlingDemoResetQuery = false;
      }, 0);
    }
  }, [location.search, navigate, showToast]);
}
