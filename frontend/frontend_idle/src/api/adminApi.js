import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Axios 인스턴스 생성
const adminApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// 요청 인터셉터 설정
adminApi.interceptors.request.use(
    config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const loginAdmin = async (adminId, password) => {
    try {
        // 로그인 요청은 인터셉터를 통과하지만, 보통 토큰이 없는 상태이므로 헤더가 추가되지 않음
        const response = await adminApi.post(`/admin/login`, {
            adminId,
            password
        });
        // 로그인 성공 시 토큰을 저장하는 로직이 필요할 수 있음 (예: response.data.token)
        if (response.data.token) {
            localStorage.setItem('accessToken', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Admin login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createAdmin = async (adminData) => {
    try {
        const response = await adminApi.post(`/admin/accounts`, adminData);
        return response.data;
    } catch (error) {
        console.error('Admin creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAdminList = async (params = {}) => {
    try {
        const response = await adminApi.get(`/admin/accounts`, {
            params: params,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin list:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getCustomerList = async (params = {}) => {
    try {
        const response = await adminApi.get(`/admin/customers`, {
            params: params,
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customer list:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createCustomer = async (customerData) => {
    try {
        const response = await adminApi.post(`/admin/customers`, customerData);
        return response.data;
    } catch (error) {
        console.error('Customer creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createNotice = async (noticeData) => {
    try {
        const response = await adminApi.post(`/admin/notices`, noticeData);
        return response.data;
    } catch (error) {
        console.error('Notice creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAllNotices = async () => {
    try {
        const response = await adminApi.get(`/admin/notices`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notices:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteNotice = async (noticeId) => {
    try {
        const response = await adminApi.delete(`/admin/notices/${noticeId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete notice:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const toggleNoticeActive = async (noticeId) => {
    try {
        const response = await adminApi.patch(`/admin/notices/${noticeId}/toggle`, {});
        return response.data;
    } catch (error) {
        console.error('Failed to toggle notice activation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fetchChatSessionDetails = async (chatRoomId) => {
    try {
        const response = await adminApi.get(`/admin/chat-sessions/${chatRoomId}/details`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch chat session details for ${chatRoomId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const fetchCustomerRecentInquiries = async (customerId) => {
    try {
        const response = await adminApi.get(`/admin/inquiries/customer/${customerId}/recent`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch recent inquiries for customer ${customerId}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// FAQ Management
export const getAllFAQs = async () => {
    try {
        const response = await adminApi.get(`/admin/faqs`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch FAQs:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const createFAQ = async (faqData) => {
    try {
        const response = await adminApi.post(`/admin/faqs`, faqData);
        return response.data;
    } catch (error) {
        console.error('FAQ creation failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateFAQ = async (faqId, faqData) => {
    try {
        const response = await adminApi.put(`/admin/faqs/${faqId}`, faqData);
        return response.data;
    } catch (error) {
        console.error('FAQ update failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteFAQ = async (faqId) => {
    try {
        const response = await adminApi.delete(`/admin/faqs/${faqId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete FAQ:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const toggleFAQActive = async (faqId) => {
    try {
        const response = await adminApi.patch(`/admin/faqs/${faqId}/toggle`, {});
        return response.data;
    } catch (error) {
        console.error('Failed to toggle FAQ activation:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getRecentlyCreatedAdmins = async (size, page, dateRange) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/recent-admins/created`, { params: { size, page, dateRange } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recently created admins:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getRecentlyDeletedAdmins = async (size, page, dateRange) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/recent-admins/deleted`, { params: { size, page, dateRange } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recently deleted admins:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getRecentlyCreatedCustomers = async (size, page, dateRange) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/recent-customers/created`, { params: { size, page, dateRange } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recently created customers:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getRecentlyDeletedCustomers = async (size, page, dateRange) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/recent-customers/deleted`, { params: { size, page, dateRange } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recently deleted customers:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getDailyCustomerCreationCounts = async (year, month) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/customer-creation-counts`, { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch daily customer creation counts:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getDailyCustomerDeletionCounts = async (year, month) => {
    try {
        const response = await adminApi.get(`/admin/dashboard/customer-deletion-counts`, { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch daily customer deletion counts:', error.response ? error.response.data : error.message);
        throw error;
    }
};
