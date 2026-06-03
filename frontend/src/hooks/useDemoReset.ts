import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetDemoWorkspace } from "@/services/demoResetService";

export function useDemoReset() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const noticeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const resetDemo = useCallback(() => {
    const result = resetDemoWorkspace();
    setNotice(result.message);
    navigate("/", { replace: true });

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setNotice(""), 3200);
  }, [navigate]);

  return { notice, resetDemo };
}
