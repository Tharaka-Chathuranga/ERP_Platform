import axios from "axios";
import { getAccessToken, setAccessToken } from "./access-token";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export { getAccessToken as getToken, setAccessToken as setToken };

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from an RFC-7807 ProblemDetail response. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; title?: string } | undefined;
    return data?.detail ?? data?.title ?? error.message;
  }
  return "Unexpected error";
}
