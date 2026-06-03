import { useCallback, useEffect, useRef, useState } from "react";

export function useTimedNotice(timeoutMs = 3000) {
  const [notice, setNotice] = useState("");
  const noticeTimerRef = useRef<number | undefined>(undefined);

  const clearNoticeTimer = useCallback(() => {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = undefined;
    }
  }, []);

  useEffect(() => clearNoticeTimer, [clearNoticeTimer]);

  const showNotice = useCallback(
    (message: string) => {
      clearNoticeTimer();
      setNotice(message);
      noticeTimerRef.current = window.setTimeout(() => setNotice(""), timeoutMs);
    },
    [clearNoticeTimer, timeoutMs],
  );

  return { notice, showNotice };
}
