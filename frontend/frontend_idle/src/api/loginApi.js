
import axios from "axios";
import axiosInstance from "./axiosInstance";
import { API_SERVER_HOST } from "./paymentApi";

const prefix = `${API_SERVER_HOST}/api`;


export const login = async (customer) => {
    try {
        const res = await axiosInstance.post(`${prefix}/auth/login`, customer);

        return res.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "로그인 실패");
        } else {
            throw new Error("서버와 연결할 수 없습니다");
        }
    }
}

// ID & 비밀번호 체크
export const checkAccount = async (id, password) => {
    try {
        const res = await axios.post(`${prefix}/customer/check-account`, {
            id,
            passwordEnc: password
        });
        return res.data;
    } catch (err) {
        alert("로그인 중 오류 발생");
        return false;
    }
};