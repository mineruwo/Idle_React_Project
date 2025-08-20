import axios from "axios"

const host = `${process.env.REACT_APP_API_BASE_URL}/customer`;

export const signUp = async (id) => {
    try {
        const res = await axios.post(`${host}/signup`, id);

        return res.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "회원가입 실패:", error.response ? error.response.data : error.message);
        } else {
            throw new Error("서버와 연결할 수 없습니다");
        }
    }
}

// 아이디 중복검사
export const checkIdDuplicate = async (id) => {
    try {
        const res = await axios.get(`${host}/check-id?id=${id}`);
        return res.data;
    } catch (err) {
        alert("아이디 중복 확인 중 오류 발생");
        return false;
    }
};

// 닉네임 중복검사
export const checkNicknameDuplicate = async (nickname) => {
    try {
        const res = await axios.get(`${host}/check-nickname?nickname=${nickname}`);
        return res.data;
    } catch (err) {
        alert("닉네임 중복 확인 중 오류 발생");
        return false;
    }
};

