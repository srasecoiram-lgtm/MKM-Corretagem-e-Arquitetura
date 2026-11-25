import axios from "axios";

const baseURL = (process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3002")).replace(/\/+$/, "");
const options = { baseURL, withCredentials: true, timeout: 10000 };
const authApi = axios.create(options);
const api = axios.create(options);
const listeners = new Set();
let session = null;
let refreshRequest;
let sessionVersion = 0;

function setSession(value) {
  session = value;
  listeners.forEach((listener) => listener(value));
}

export function subscribeSession(listener) {
  listeners.add(listener);
  listener(session);
  return () => listeners.delete(listener);
}

export function refreshSession() {
  if (refreshRequest) return refreshRequest;
  const version = sessionVersion;
  const pending = authApi.post("/auth/refresh").then(({ data }) => {
    if (version !== sessionVersion) return null;
    setSession(data);
    return data;
  }).catch((error) => {
    if (version === sessionVersion && error.response?.status === 401) setSession(null);
    throw error;
  }).finally(() => {
    if (refreshRequest === pending) refreshRequest = undefined;
  });
  refreshRequest = pending;
  return pending;
}

export async function loginSession(email, senha) {
  sessionVersion++;
  refreshRequest = undefined;
  const { data } = await authApi.post("/login", { email, senha });
  setSession(data);
  return data;
}

export async function logoutSession() {
  sessionVersion++;
  refreshRequest = undefined;
  setSession(null);
  await authApi.post("/auth/logout");
}

export function externalUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function mediaUrl(value) {
  return /^\/uploads\/[a-z0-9/-]+\.(?:jpe?g|png|webp)$/i.test(value || "")
    ? baseURL + value
    : externalUrl(value);
}

api.interceptors.request.use((config) => {
  if (session?.token) config.headers.set("Authorization", "Bearer " + session.token);
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  if (error.response?.status !== 401 || !request || request._retry) throw error;
  const code = error.response.data?.code;
  if (code === "TOKEN_INVALID" && request.headers.get("Authorization") === "Bearer " + session?.token) {
    setSession(null);
    throw error;
  }
  if (code !== "TOKEN_EXPIRED") throw error;

  request._retry = true;
  if (request.headers.get("Authorization") === "Bearer " + session?.token) {
    await refreshSession();
  }
  if (!session?.token) throw error;
  return api(request);
});

export default api;
