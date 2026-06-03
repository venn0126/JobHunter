import { useLocation, useNavigate } from "react-router-dom";
import { rememberUpdateRestorePoint } from "@/lib/updateRestore";
import { useJobStore } from "@/stores/jobStore";
import { usePersonaStore } from "@/stores/personaStore";

export function useStartUpdate() {
  const location = useLocation();
  const navigate = useNavigate();

  return () => {
    const jobState = useJobStore.getState();
    rememberUpdateRestorePoint({
      filters: jobState.filters,
      path: `${location.pathname}${location.search}`,
      personaId: usePersonaStore.getState().activePersonaId,
      sortKey: jobState.sortKey,
    });
    navigate("/update");
  };
}
