import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

export const payWithPoints = async ({ userId, points }) => {
    try {
        const response = await axios.post(
            `${API_SERVER_HOST}/api/payment/use`,
            {
                userId: userId,
                points: points,
            }
        );
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message || "결제 중 오류가 발생했습니다.";
        throw new Error(message);
    }
};

export const preparePayment = async (paymentData) => {
    console.log("paymentData:", paymentData);
    try {
        const response = await axios.post(
            `${API_SERVER_HOST}/api/payment/prepare`,
            paymentData
        );
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
        const response = await axios.post(
            `${API_SERVER_HOST}/api/payment/verify`,
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

export const fetchUserPoints = async () => {
    try {
        const response = await axios.get(
            `${API_SERVER_HOST}/api/customer/user/points`,
            {
                withCredentials: true,
            }
        );
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
        const response = await axios.post(
            `${API_SERVER_HOST}/api/payment/fail`,
            { merchantUid }
        );
        return response.data;
    } catch (error) {
        console.error("결제 실패 정보 전송 중 오류 발생:", error);
    }
};
