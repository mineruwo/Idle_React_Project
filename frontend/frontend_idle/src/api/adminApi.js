import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 서버 주소

export const loginAdmin = async (adminId, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/login`, {
            adminId,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Admin login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};
