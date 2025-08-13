import axios from "axios";

// 이메일 인증 코드 발송
export const sendEmailCode = async (email) => {
    return await axios.post("/api/email/send-code", null, { params: { email } });
};

// 이메일 인증 코드 검증
export const verifyEmailCode = async (email, code) => {
    return await axios.post("/api/email/verify-code", null,
        {
            params: { email, code },
            withCredentials: true
        });
};