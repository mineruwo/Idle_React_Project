import axios from "axios"
import { API_SERVER_HOST } from "./paymentApi";

const host = `${API_SERVER_HOST}/api/customer`;


export const login = async (customer) => {
    try {
        const res = await axios.post(`${host}/login`, customer);

        return res.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "회원가입 실패");
        } else {
            throw new Error("서버와 연결할 수 없습니다");
        }
    }
}

// ID & 비밀번호 체크
export const checkAccountOk = async (id, password) => {
    try {
        const res = await axios.post(`${host}/check-account`, {
            id,
            password
        });
        return res.data;
    } catch (err) {
        alert("로그인 중 오류 발생");
        return false;
    }
};