import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetDemoWorkspace } from "@/services/demoResetService";

export function useDemoResetFromQuery() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reset") !== "demo") {
      return;
    }

    resetDemoWorkspace();
    params.delete("reset");
    params.set("mode", "demo");
    navigate({ pathname: "/", search: `?${params.toString()}` }, { replace: true });
  }, [location.search, navigate]);
}
