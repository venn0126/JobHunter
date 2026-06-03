import { useLocation, useNavigate } from "react-router-dom";
import { rememberUpdateRestorePath } from "@/lib/updateRestore";

export function useStartUpdate() {
  const location = useLocation();
  const navigate = useNavigate();

  return () => {
    rememberUpdateRestorePath(`${location.pathname}${location.search}`);
    navigate("/update");
  };
}
