import api from "../api/authApi"; // withCredentials: true + 401->refresh 인터셉터 적용된 인스턴스

export const autoLogin = async () => {
    try {
        const { data } = await api.get("/auth/auto"); // 쿠키 자동 전송
        return { authenticated: true, profile: data };
    } catch {
        return { authenticated: false, profile: null };
    }
};
