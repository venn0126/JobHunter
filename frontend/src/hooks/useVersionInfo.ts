import { useEffect, useState } from "react";
import type { VersionInfo } from "@/types/version";

const fallbackVersion: VersionInfo = {
  app: "JobHunter",
  version: "0.1.0",
  build_id: "local-dev",
  updated_at: "",
  data_mode: "mock",
};

export function useVersionInfo() {
  const [version, setVersion] = useState<VersionInfo>(fallbackVersion);

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : fallbackVersion))
      .then((data: VersionInfo) => setVersion(data))
      .catch(() => setVersion(fallbackVersion));
  }, []);

  return version;
}
