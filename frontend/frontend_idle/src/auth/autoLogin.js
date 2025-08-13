import api from "../api/authApi";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

export const autoLogin = async () => {
    const token = getAccessToken();
    if (!token) return { authenticated: false, profile: null };

    try {
        const auto = await api.get("/auth/auto");
        return { authenticated: true, profile: auto.data };
    } catch (e) {
        try {
            const { data } = await api.post("/auth/refresh");
            setAccessToken(data.accessToken);
            const auto = await api.get("/auth/auto");
            return { authenticated: true, profile: auto.data };
        } catch {
            clearAccessToken();
            return { authenticated: false, profile: null};
        }
    }
}

