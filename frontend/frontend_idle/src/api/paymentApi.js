import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 백엔드와 쿠키를 주고받기 위해 withCredentials를 기본값으로 설정한 단일 인스턴스
const paymentApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const payWithPoints = async ({ userId, points }) => {
    try {
        const response = await paymentApi.post("/payment/use", {
            userId: userId,
            points: points,
        });
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message || "결제 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const payOrderWithPoints = async (paymentData) => {
    try {
        const response = await paymentApi.post(
            "/payment/point-only",
            paymentData
        );
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "포인트 결제 처리 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const preparePayment = async (paymentData) => {
    console.log("paymentData:", paymentData);
    try {
        const response = await paymentApi.post("/payment/prepare", paymentData);
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "결제 준비 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const verifyPayment = async (verificationData) => {
    try {
        const response = await paymentApi.post(
            "/payment/verify",
            verificationData
        );
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "결제 검증 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const verifyPointCharge = async (verificationData) => {
    try {
        const response = await paymentApi.post(
            "/payment/verify-charge",
            verificationData
        );
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "포인트 충전 검증 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const fetchUserPoints = async () => {
    try {
        const response = await paymentApi.get("/customer/user/points");
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message ||
            "사용자 포인트를 가져오는 데 실패했습니다.";
        throw new Error(message);
    }
};

export const failPayment = async (merchantUid) => {
    try {
        const response = await paymentApi.post("/payment/fail", {
            merchantUid,
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "결제 실패 정보 전송 중 오류 발생"
        );
    }
};

export const getOrderById = async (orderId) => {
    try {
        const response = await paymentApi.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error(`ID ${orderId} 주문 정보 조회 실패:`, error);
        throw new Error(
            error.response?.data?.message || "주문 정보를 가져오는 중 오류 발생"
        );
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await paymentApi.put(
            `/orders/${orderId}/status`,
            status, // Send status directly as a plain string
            {
                headers: {
                    "Content-Type": "text/plain", // Change back to text/plain
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`주문 ID ${orderId} 상태 업데이트 실패:`, error);
        throw new Error(
            error.response?.data?.message || "주문 상태 업데이트 중 오류 발생"
        );
    }
};
