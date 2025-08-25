// src/api/inquiryApi.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

/**
 * 📝 문의 생성 (인증)
 */
export const createInquiry = async (inquiryData) => {
    const { data } = await authClient.post("/inquiries", inquiryData, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

/**
 * 📋 고객 ID로 문의 목록 조회 (인증)
 */
export const getInquiriesByCustomerId = async (customerId) => {
    const { data } = await authClient.get(`/inquiries/customer/${customerId}`);
    return data;
};

/**
 * 📋 모든 문의 목록 조회 (인증)
 */
export const getAllInquiries = async (pageable) => {
    const { data } = await authClient.get("/inquiries", { params: pageable });
    return data;
};

/**
 * ✏️ 문의 답변 및 상태 업데이트 (인증)
 */
export const updateInquiry = async (inquiryId, inquiryData) => {
    const { data } = await authClient.put(`/inquiries/${inquiryId}`, inquiryData, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};
