import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 서버 주소

export const loginAdmin = async (adminId, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
            adminId,
            password
        }, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Admin login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createAdmin = async (adminData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/admin/accounts`, adminData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Admin creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAdminList = async (page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/accounts`, {
            params: { page, size },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin list:', error.response ? error.response.data : error.message);
        throw error;
    }
};