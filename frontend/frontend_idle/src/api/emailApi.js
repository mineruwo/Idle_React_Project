import axios from "axios";

export const PURPOSE = Object.freeze({
    SIGNUP_VERIFY_EMAIL: "SIGNUP_VERIFY_EMAIL",
    RESET_PASSWORD: "RESET_PASSWORD",
});

const sendEmailCode = (email, purpose) =>
    axios.post("/api/email/send-code", null, {
        params: { email, purpose },
        withCredentials: true,
    });

const verifyEmailCode = (email, code, purpose) =>
    axios.post("/api/email/verify-code", null, {
        params: { email, code, purpose },
        withCredentials: true,
    });


// 회원가입용
export const sendSignupEmailCode = (email) => sendEmailCode(email, PURPOSE.SIGNUP_VERIFY_EMAIL);
export const verifySignupEmailCode = (email, code) => verifyEmailCode(email, code, PURPOSE.SIGNUP_VERIFY_EMAIL);

// 비밀번호 재설정용
export const sendResetEmailCode = (email) => sendEmailCode(email, PURPOSE.RESET_PASSWORD);
export const verifyResetEmailCode = (email, code) => verifyEmailCode(email, code, PURPOSE.RESET_PASSWORD);