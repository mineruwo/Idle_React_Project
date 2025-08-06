import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

const rest_api_key = `6242610400536318`;

const rest_api_secret = `5X7zrxpdCjx3bUde6eMlSPHITZwxaTTdg0na2cLQK8H7NNs4m3EjTPiDMvQqiqXfcE5Vhas18I9dTO1n`;

export const payWithPoints = async (userId, pointsToUse) => {
    try {
        const response = await axios.post(
            `${API_SERVER_HOST}/api/payment/use`,
            {
                userId: userId,
                points: pointsToUse,
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

export const fetchUserPoints = async (userId) => {
    try {
        const response = await axios.get(`${API_SERVER_HOST}/api/user/${userId}/points`);
        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.message || "사용자 포인트를 가져오는 데 실패했습니다.";
        throw new Error(message);
    }
};
