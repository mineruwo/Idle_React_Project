import axios from "axios";
import { getTokenFromCookie } from "../utils/authCookie";

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

api.interceptors.response.use (
    (res) => res,
    async (error) => {
        const origin = error.config;
        if (error.response?.status === 401 && !origin._retry) {
            origin._retry = true;
        }
    }
)
