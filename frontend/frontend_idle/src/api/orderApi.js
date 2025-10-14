// src/api/order/orderApi.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const orderApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

/**
 * ✅ 퍼블릭 전용 클라이언트
 * - withCredentials 강제 false
 * - 전역 인터셉터/디폴트에 쿠키/Authorization이 있어도 제거
 */
export const publicClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    timeout: 15000,
});

// 혹시 전역 기본값/인터셉터로 Authorization 이 들어가더라도 제거
publicClient.interceptors.request.use((config) => {
    // 절대 자격증명 안 보냄
    config.withCredentials = false;
    // 안전장치: Authorization 헤더 있으면 제거
    if (config.headers && "Authorization" in config.headers) {
        delete config.headers.Authorization;
    }
    return config;
});

/**
 * 🔐 인증 전용 클라이언트 (쓰기 용도)
 * - withCredentials true (세션/쿠키 사용)
 */
export const authClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15000,
});

authClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            // For API calls, we shouldn't be redirected to a login page.
            // Instead, we reject the promise with a clear error message.
            // This prevents the browser from following a faulty redirect and causing SSL errors.
            return Promise.reject(
                new Error("인증에 실패했습니다. 다시 로그인해주세요.")
            );
        }
        // Handle cases where the error is a network error from a bad redirect
        if (!error.response && error.message === "Network Error") {
            console.error(
                "Network Error: This might be due to a redirect to an incorrect protocol (e.g., http to https) or a CORS issue. Check backend security configuration."
            );
            return Promise.reject(
                new Error(
                    "서버에 연결할 수 없습니다. 백엔드 인증 리디렉션 문제일 수 있습니다."
                )
            );
        }
        return Promise.reject(error);
    }
);

/* ------------------------------------------------------------------ */
/*                                오더                                 */
/* ------------------------------------------------------------------ */

/** 🚚 오더 등록 (쓰기 → 인증 클라이언트) */
export const saveOrder = async (orderData) => {
    const { data } = await authClient.post("/orders", orderData, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

/**
 * 📋 오더 목록/검색 (퍼블릭 GET)
 * - q가 있으면 /orders?q=... (주문번호/출발/도착/상태/차량/화물/포장 검색)
 * - 없으면 최신순 전체
 */
export const fetchOrders = async (q) => {
    const { data } = await authClient.get("/orders", {
        // axios가 알아서 ?q=... 구성
        params: q && String(q).trim() ? { q: String(q).trim() } : undefined,
    });
    return data;
};

/** 🔍 특정 오더 단건 (퍼블릭 GET) */
export const fetchOrderById = async (orderId) => {
    const { data } = await publicClient.get(`/orders/${orderId}`);
    return data;
};

/** ❌ 오더 삭제 (쓰기 → 인증) */
export const deleteOrder = async (orderId) => {
    await authClient.delete(`/orders/${orderId}`);
};

/** ✏️ 오더 수정 (쓰기 → 인증) */
export const updateOrder = async (orderId, updatedData) => {
    const { data } = await authClient.put(`/orders/${orderId}`, updatedData, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

/** 📋 내 오더 목록 (인증 GET) */
export const fetchMyOrders = async () => {
    const { data } = await authClient.get("/orders/my");
    return data;
};

/* ------------------------------------------------------------------ */
/*                             입찰(오퍼)                               */
/* ------------------------------------------------------------------ */

/** 📊 입찰 요약 (퍼블릭 GET) → { count, minPrice, avgPrice } */
export const getDriverOfferSummary = async (orderId) => {
    const { data } = await publicClient.get(
        `/orders/${orderId}/offers/summary`
    );
    return data;
};

/**
 * 📝 입찰 등록 (쓰기 → 인증)
 * - driverId는 보내지 않음(백엔드가 토큰에서 식별)
 */
export const createDriverOffer = async (orderId, { price, memo = "" }) => {
    const { data } = await authClient.post(
        `/orders/${orderId}/offers`,
        { price, memo },
        { headers: { "Content-Type": "application/json" } }
    );
    return data;
};
