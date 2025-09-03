import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

const skipAuthUrl = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/reset-password"];

// 401 (재발급) 처리
let isRefreshing = false;
let queue = [];

api.interceptors.response.use((res) => res, async (error) => {
  const original = error.config;
  if (!error.response || !original) throw error;

  const urlPath = original.url?.startsWith("http")
    ? new URL(original.url).pathname.replace(/^\/api/, "")
    : original.url;

  const isAuthApi = skipAuthUrl.includes(urlPath);
  const status = error.response.status;

  const shouldTryRefresh =
    (!isAuthApi && status === 401) ||
    (!isAuthApi && status === 403 && urlPath === "/auth/me");

  if (!shouldTryRefresh) {
    throw error;
  }

  if (original._retry) throw error;
  original._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject, original });
    });
  }

  isRefreshing = true;

  try {
    await api.post("/auth/refresh");
    queue.forEach(({ resolve, original }) => resolve(api(original)));
    queue = [];
    return api(original);
  } catch (e) {
    try { await api.post("/auth/logout"); } catch { }
    queue.forEach(({ reject }) => reject(e));
    queue = [];
    throw e;
  } finally {
    isRefreshing = false;
  }
});

export default api;

