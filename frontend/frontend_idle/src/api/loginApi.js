
import axios from "axios";
import api from "./authApi";
import { clearAccessToken, setAccessToken } from "../auth/tokenStore";

export const login = async (customer) => {
    try {
        const { data } = await api.post("/auth/login", customer);

        setAccessToken(data.accessToken);

        return data;
    } catch (error) {
        clearAccessToken();

        if (error.response) {
            throw new Error(error.response.data.message || "로그인 실패");
        } else {
            throw new Error("서버와 연결할 수 없습니다");
        }
    }
}

export const logout = async () => {
    await api.post("/auth/logout");
    clearAccessToken();
}

// ID & 비밀번호 체크
export const checkAccount = async (id, password) => {

    try {
        const { data } = await api.post("/customer/check-account", {
            id,
            passwordEnc: password
        });

        return data;
    } catch (err) {
        alert("로그인 중 오류 발생");
        return false;
    }
};