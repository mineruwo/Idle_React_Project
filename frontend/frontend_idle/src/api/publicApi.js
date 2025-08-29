import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const publicApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const getAllNotices = async () => {
    try {
        const response = await publicApi.get(`/public/notices`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch notices:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getAllFAQs = async () => {
    try {
        const response = await publicApi.get(`/public/faqs`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch FAQs:', error.response ? error.response.data : error.message);
        throw error;
    }
};
