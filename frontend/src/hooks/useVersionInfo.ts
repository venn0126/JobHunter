import { useEffect, useState } from "react";
import { appConfig } from "@/config/env";
import type { VersionInfo } from "@/types/version";

const fallbackVersion: VersionInfo = {
  app: "JobHunter",
  version: "0.1.0",
  build_id: "local-dev",
  updated_at: "",
  data_mode: "mock",
};

export interface VersionState {
  current: VersionInfo;
  hasUpdate: boolean;
  latest: VersionInfo;
  loading: boolean;
}

function isSameBuild(left: VersionInfo, right: VersionInfo) {
  return left.version === right.version && left.build_id === right.build_id;
}

const subscribers = new Set<(state: VersionState) => void>();
let baselineVersion: VersionInfo | null = null;
let versionState: VersionState = {
  current: fallbackVersion,
  hasUpdate: false,
  latest: fallbackVersion,
  loading: true,
};
let started = false;
let intervalId: number | undefined;

function emit(nextState: VersionState) {
  versionState = nextState;
  subscribers.forEach((subscriber) => subscriber(nextState));
}

function loadVersion() {
  fetch("/version.json", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : fallbackVersion))
    .then((data: VersionInfo) => {
      baselineVersion = baselineVersion ?? data;
      emit({
        current: baselineVersion,
        hasUpdate: !isSameBuild(baselineVersion, data),
        latest: data,
        loading: false,
      });
    })
    .catch(() => {
      baselineVersion = baselineVersion ?? fallbackVersion;
      emit({
        current: baselineVersion,
        hasUpdate: false,
        latest: baselineVersion,
        loading: false,
      });
    });
}

function startVersionWatcher() {
  if (started) {
    return;
  }

  started = true;
  loadVersion();

  const shouldPoll = appConfig.isDemoMode || appConfig.versionPollIntervalMs > 0;
  if (shouldPoll) {
    intervalId = window.setInterval(loadVersion, Math.max(10_000, appConfig.versionPollIntervalMs));
  }
}

function stopVersionWatcherIfUnused() {
  if (subscribers.size > 0 || intervalId === undefined) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = undefined;
  started = false;
}

export function useVersionInfo() {
  const [state, setState] = useState<VersionState>(versionState);

  useEffect(() => {
    subscribers.add(setState);
    setState(versionState);
    startVersionWatcher();
    return () => {
      subscribers.delete(setState);
      stopVersionWatcherIfUnused();
    };
  }, []);

  return state;
}
