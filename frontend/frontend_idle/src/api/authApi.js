import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "../utils/tokenStore";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});


api.interceptors.request.use((config) => {
    const token = getAccessToken();
    
    if (token) config.headers.Authorization =`Bearer ${token}`;
    
    return config;
});

let isRefreshing = false;
let queue = [];

api.interceptors.response.use( (res) => res, async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh"); 

        setAccessToken(data.accessToken);

        queue.forEach(({ resolve, original }) => {
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          resolve(api(original));
        });

        queue = [];

        return api(original);

      } catch (e) {
        queue.forEach(({ reject }) => reject(e));

        queue = [];

        clearAccessToken();

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

