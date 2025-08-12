import { createContext, useContext, useEffect, useState } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";
import api from "../api/authApi";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [state, setState] = useState({ loading: true, authenticated: false, profile: null });

    useEffect(() => {
        (async () => {
            const token = getAccessToken();
            if (!token) {
                setState({ loading: false, authenticated: false, profile: null });
                return;
            }
            try {
                const auto = await api.get("/auth/auto");
                setState({ loading: false, authenticated: true, profile: auto.data });
            } catch {
                try {
                    const { data } = await api.post("/auth/refresh");
                    setAccessToken(data.accessToken);
                    const auto = await api.get("/auth/auto");
                    setState({ loading: false, authenticated: true, profile: auto.data });
                } catch {
                    clearAccessToken();
                    setState({ loading: false, authenticated: false, profile: null });
                }
            }
        })();
    }, []);

    return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}