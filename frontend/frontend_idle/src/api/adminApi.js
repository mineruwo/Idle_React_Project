import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // 백엔드 서버 주소

export const loginAdmin = async (adminId, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/login`, {
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
        const response = await axios.post(`${API_BASE_URL}/admin/accounts`, adminData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Admin creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAdminList = async (page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/accounts`, {
            params: { page, size },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin list:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getCustomerList = async (page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/customers`, {
            params: { page, size },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customer list:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/customers`, customerData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Customer creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createNotice = async (noticeData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/notices`, noticeData, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Notice creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAllNotices = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/admin/notices`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notices:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteNotice = async (noticeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/admin/notices/${noticeId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Failed to delete notice:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const toggleNoticeActive = async (noticeId) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/admin/notices/${noticeId}/toggle`, {}, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error('Failed to toggle notice activation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// New API functions for chat session details and customer inquiries
export const fetchChatSessionDetails = async (chatRoomId) => {
    try {
        // Mock API response for now, replace with actual backend call
        const response = await axios.get(`${API_BASE_URL}/admin/chat-sessions/${chatRoomId}/details`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch chat session details for ${chatRoomId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fetchCustomerRecentInquiries = async (customerId) => {
    try {
        // Mock API response for now, replace with actual backend call
        const response = await axios.get(`${API_BASE_URL}/admin/inquiries/customer/${customerId}/recent`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch recent inquiries for customer ${customerId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};