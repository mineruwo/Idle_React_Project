import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const paymentApi = axios.create({
    baseURL: API_BASE_URL,
});

export const payWithPoints = async ({ userId, points }) => {
    try {
        const response = await paymentApi.post(
            '/payment/use',
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
        const response = await paymentApi.post(
            '/payment/prepare',
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
        const response = await paymentApi.post(
            '/payment/verify',
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
        const response = await paymentApi.get(
            '/customer/user/points',
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
        const response = await paymentApi.post(
            '/payment/fail',
            { merchantUid }
        );
        return response.data;
    } catch (error) {
        console.error("결제 실패 정보 전송 중 오류 발생:", error);
    }
};
