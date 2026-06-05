import { appConfig } from "@/config/env";
import { useAuthStore } from "@/stores/authStore";

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  request_id: string;
}

export class ApiClientError extends Error {
  code: string;
  data: unknown;
  requestId: string;
  status: number;

  constructor({
    code,
    data,
    message,
    requestId,
    status,
  }: {
    code: string;
    data?: unknown;
    message: string;
    requestId?: string;
    status: number;
  }) {
    super(`API request failed: ${status} ${code} ${message}`);
    this.name = "ApiClientError";
    this.code = code;
    this.data = data;
    this.requestId = requestId ?? "";
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = buildHeaders(init);
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const payload = await readApiResponse<T>(response);
  if (!response.ok) {
    throw new ApiClientError({
      code: payload?.code ?? "HTTP_ERROR",
      data: payload?.data,
      message: payload?.message ?? response.statusText,
      requestId: payload?.request_id,
      status: response.status,
    });
  }

  if (!payload?.success) {
    throw new ApiClientError({
      code: payload?.code ?? "API_ERROR",
      data: payload?.data,
      message: payload?.message ?? "request failed",
      requestId: payload?.request_id,
      status: response.status,
    });
  }

  return payload.data;
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, withJsonBody("POST", body, init));
}

export function apiPatch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, withJsonBody("PATCH", body, init));
}

export function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...init, method: "DELETE" });
}

function withJsonBody(method: string, body: unknown, init: RequestInit = {}): RequestInit {
  return {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    method,
  };
}

function buildHeaders(init: RequestInit) {
  const headers = new Headers(init.headers);
  const hasJsonBody = typeof init.body === "string";
  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("X-Request-ID")) {
    headers.set("X-Request-ID", createRequestId());
  }

  const token = useAuthStore.getState().session?.accessToken;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      code: "INVALID_JSON",
      message: text.slice(0, 200),
      data: undefined as T,
      request_id: response.headers.get("X-Request-ID") ?? "",
    };
  }
}

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
