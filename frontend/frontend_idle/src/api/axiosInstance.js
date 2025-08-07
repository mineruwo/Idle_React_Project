import axios from "axios";
import { getTokenFromCookie } from "../utils/authCookie";

const instance = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
});


instance.interceptors.request.use((config) => {
    try {
        const token = getTokenFromCookie();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (err) {
        console.warn("쿠키에서 토큰을 가져오는 중 오류 발생", err);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
})

export default instance;