import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../api/authApi";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [state, setState] = useState({ loading: true, authenticated: false, profile: null });

    // 중복 호출/루프 방지용 가드
    const evaluatingRef = useRef(false);

    const evaluate = useCallback(async () => {
        if (evaluatingRef.current) return;
        evaluatingRef.current = true;
        try {
            const { data } = await api.get("/auth/auto"); // 401이면 인터셉터가 /auth/refresh 처리 후 재시도
            setState({ loading: false, authenticated: true, profile: data });
        } catch {
            setState({ loading: false, authenticated: false, profile: null });
        } finally {
            evaluatingRef.current = false;
        }
    }, []);

    const logOut = useCallback(async () => {
        try { await api.post("/auth/logout"); } catch { }
        setState({ loading: false, authenticated: false, profile: null });
        try { localStorage.setItem("auth:pulse", String(Date.now())); } catch { }
    }, []);

    // 최초 1회 상태 결정
    useEffect(() => {
        evaluate();
    }, [evaluate]);

    useEffect(() => {
        const onFocus = () => evaluate();
        const onStorage = (e) => { if (e.key === "auth:pulse") evaluate(); };
        window.addEventListener("focus", onFocus);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("storage", onStorage);
        };
    }, [evaluate]);

    return (
        <AuthContext.Provider value={{ ...state, refreshAuth: evaluate, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}