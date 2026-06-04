import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { resetDemoWorkspace } from "@/services/demoResetService";

export function useDemoReset() {
  const navigate = useNavigate();

  const resetDemo = useCallback(() => {
    const result = resetDemoWorkspace();
    navigate("/", { replace: true });
    return result;
  }, [navigate]);

  return { resetDemo };
}
