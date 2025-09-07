import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Axios 인스턴스 생성
export const adminApi = axios.create({
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

export const setAuthToken = (token) => {
    if (token) {
        adminApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete adminApi.defaults.headers.common['Authorization'];
    }
};

// 요청 인터셉터 설정
adminApi.interceptors.request.use(
    config => {
        // 토큰이 이미 defaults.headers.common에 설정되어 있으므로, 여기서 다시 설정할 필요 없음
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 요청 인터셉터 설정
adminApi.interceptors.request.use(
    config => {
        // HttpOnly 쿠키는 브라우저가 자동으로 전송하므로, 여기서 수동으로 헤더를 추가할 필요 없음
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const loginAdmin = async (adminId, password) => {
    try {
        const response = await adminApi.post(`/admin/login`, {
            adminId,
            password
        });
        // 토큰은 HttpOnly 쿠키로 설정되므로, 여기서 localStorage에 저장할 필요 없음
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

export const getAdminById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/accounts/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch admin with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateAdmin = async (id, adminData) => {
    try {
        const response = await adminApi.put(`/admin/accounts/${id}`, adminData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update admin with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteAdmin = async (id) => {
    try {
        const response = await adminApi.delete(`/admin/accounts/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete admin with id ${id}:`, error.response ? error.response.data : error.message);
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

export const getCustomerById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/customers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch customer with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateCustomer = async (id, customerData) => {
    try {
        const response = await adminApi.put(`/admin/customers/${id}`, customerData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update customer with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteCustomer = async (id) => {
    try {
        const response = await adminApi.delete(`/admin/customers/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete customer with id ${id}:`, error.response ? error.response.data : error.message);
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



export const getNoticeById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/notices/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch notice with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getNoticeForEdit = async (id) => {
    try {
        const response = await adminApi.get(`/admin/notices/edit/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch notice for edit with id ${id}:`, error.response ? error.response.data : error.message);
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


export const updateNotice = async (id, noticeData) => {
    try {
        const response = await adminApi.put(`/admin/notices/${id}`, noticeData);
        return response.data;
    } catch (error) {
        console.error('Notice update failed:', error.response ? error.response.data : error.message);
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

export const getFaqById = async (id) => {
    try {
        const response = await adminApi.get(`/admin/faqs/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch FAQ with id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getFaqForEdit = async (id) => {
    try {
        const response = await adminApi.get(`/admin/faqs/edit/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch FAQ for edit with id ${id}:`, error.response ? error.response.data : error.message);
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

export const getAllInquiries = async (params = {}) => {
    try {
        const response = await adminApi.get(`/inquiries`, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch inquiries:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getDailyAnswerCounts = async (year, month) => {
    try {
        const response = await adminApi.get(`/admin/inquiries/daily-answers`, { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch daily answer counts:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getDailyInquiryCounts = async (year, month) => {
    try {
        const response = await adminApi.get(`/inquiries/daily-counts`, { params: { year, month } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch daily inquiry counts:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Car Owner Settlement Batch APIs
export const getCarOwnerSettlementBatches = async (params = {}) => {
    try {
        const response = await adminApi.get(`/admin/car-owner-settlements`, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch car owner settlement batches:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getCarOwnerSettlementBatchDetails = async (id) => {
    try {
        const response = await adminApi.get(`/admin/car-owner-settlements/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch car owner settlement batch details for id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const updateCarOwnerSettlementStatus = async (id, newStatus) => {
    try {
        const response = await adminApi.put(`/admin/car-owner-settlements/${id}/status`, { status: newStatus });
        return response.data;
    } catch (error) {
        console.error(`Failed to update car owner settlement status for id ${id}:`, error.response ? error.response.data : error.message);
        throw error;
    }
};
