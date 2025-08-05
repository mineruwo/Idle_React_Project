import axios from "axios"
import { API_SERVER_HOST } from "./paymentApi";

const host = `${API_SERVER_HOST}/api/customer`;

alert("호스트 주소: " + host);

export const signUp = async (customer) => {
    try {
        const res = await axios.post(`${host}/signup`, customer);

        return res.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "회원가입 실패");
        } else {
            throw new Error("서버와 연결할 수 없습니다");
        }
    }
}


// 아이디 중복검사
export const checkIdDuplicate = async (id) => {
    alert("id check");
    try {
        const res = await axios.get(`${host}/check-id?id=${id}`);
        alert("아이디 중복 응답값: " + res.data); // ✅ 진짜로 값 확인
        return res.data;
    } catch (err) {
        alert("❌ 아이디 중복 확인 중 오류 발생");
        return false;
    }

};

// 닉네임 중복검사
export const checkNicknameDuplicate = async (nickname) => {
    try {
        const res = await axios.get(`${host}/check-nickname?nickname=${nickname}`);
        alert("닉네임 중복 응답값: " + res.data); // ✅ 진짜로 값 확인
        return res.data;
    } catch (err) {
        alert("❌ 닉네임 중복 확인 중 오류 발생");
        return false;
    }
};

