import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

const skipAuthUrl = ["/auth/login", "auth/refresh", "/auth/logout"];

// 401 (재발급) 처리
let isRefreshing = false;
let queue = [];

api.interceptors.response.use((res) => res, async (error) => {
  const original = error.config;

  if (!error.response) throw error;

  const isAuthApi = skipAuthUrl.some((u) => original?.url?.includes(u));

  if (error.response.status === 401 && !isAuthApi) {
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

      queue.forEach(({ resolve, original }) => {
        resolve(api(original));
      });
      queue = [];

      return api(original);
    } catch (e) {
      queue.forEach(({ reject }) => reject(e));
      queue = [];

      // 여기서 로그인 페이지로 보내도 됨
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
  throw error;
}
);

export default api;

