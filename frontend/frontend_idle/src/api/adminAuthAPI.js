import axios from 'axios';
import { adminApi } from './adminApi';

// 백엔드 API 기본 URL (실제 백엔드 URL로 변경 필요)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'; 

export const checkAdminAuth = async () => {
    try {
        const response = await adminApi.get('/admin/check-auth'); // '/api' 제거
        return response.data;
    } catch (error) {
        console.error("Admin authentication check failed:", error);
        throw error;
    }
};

