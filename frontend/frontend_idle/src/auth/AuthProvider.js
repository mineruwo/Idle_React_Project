import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    ACCESS_TOKEN_KEY,
    AUTH_CHANGE_EVENT,
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from "./tokenStore";
import api from "../api/authApi";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const SKIP_REFRESH_ONCE = "auth:skipRefreshOnce";

export default function AuthProvider({ children }) {
    const [state, setState] = useState({
        loading: true,
        authenticated: false,
        profile: null,
    });

    // 중복 호출/루프 방지용 가드
    const evaluatingRef = useRef(false);
    const lastTokenRef = useRef(getAccessToken() || null);
    const skipRefreshOnceRef = useRef(false);

    const logOut = useCallback(() => {
        skipRefreshOnceRef.current = true;
        sessionStorage.setItem(SKIP_REFRESH_ONCE, "1");
        clearAccessToken();
        lastTokenRef.current = null;
        setState({ loading: false, authenticated: false, profile: null });
    }, []);

    const evaluate = useCallback(async () => {
        if (evaluatingRef.current) return; // 중복 방지
        evaluatingRef.current = true;

        try {
            const token = getAccessToken();

            // 로그아웃 직후 한 번은 refresh 시도 생략
            const skipOnce =
                skipRefreshOnceRef.current ||
                sessionStorage.getItem(SKIP_REFRESH_ONCE) === "1";

            if (!token) {
                if (skipOnce) {
                    skipRefreshOnceRef.current = false;
                    sessionStorage.removeItem(SKIP_REFRESH_ONCE);
                    setState({
                        loading: false,
                        authenticated: false,
                        profile: null,
                    });
                    return;
                }

                try {
                    const { data } = await api.post("/auth/refresh");
                    if (data?.accessToken) {
                        setAccessToken(data.accessToken);
                        lastTokenRef.current = data.accessToken;
                    }
                    const auto = await api.get("/auth/auto");
                    setState({
                        loading: false,
                        authenticated: true,
                        profile: auto.data,
                    });
                } catch {
                    clearAccessToken();
                    setState({
                        loading: false,
                        authenticated: false,
                        profile: null,
                    });
                }
                return;
            }

            // access 토큰으로 현재 사용자 조회
            try {
                const auto = await api.get("/auth/auto");
                setState({
                    loading: false,
                    authenticated: true,
                    profile: auto.data,
                });
                return;
            } catch (_) {
                // 통과 못하면 refresh 시도
            }
            // refresh 성공 시 access 갱신 → 다시 auto
            try {
                const { data } = await api.post("/auth/refresh");
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    lastTokenRef.current = data.accessToken;
                }
                const auto2 = await api.get("/auth/auto");
                setState({
                    loading: false,
                    authenticated: true,
                    profile: auto2.data,
                });
                return;
            } catch (_) {
                // refresh도 실패 → 완전 로그아웃 상태
                clearAccessToken();
                setState({
                    loading: false,
                    authenticated: false,
                    profile: null,
                });
            }
        } finally {
            evaluatingRef.current = false;
        }
    }, []);

    // 최초 1회 상태 결정
    useEffect(() => {
        evaluate();
    }, [evaluate]);

    // 다른 탭/창 로컬스토리지 변경 감지
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === ACCESS_TOKEN_KEY) {
                const curr = getAccessToken() || null;
                if (curr !== lastTokenRef.current) {
                    lastTokenRef.current = curr;
                    evaluate();
                }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [evaluate]);

    // 같은 탭 내 커스텀 이벤트로 토큰 변경 통지 받기
    useEffect(() => {
        const onAuthChange = () => {
            const curr = getAccessToken() || null;
            if (curr !== lastTokenRef.current && !evaluatingRef.current) {
                lastTokenRef.current = curr;
                evaluate();
            }
        };
        window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
        return () =>
            window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    }, [evaluate]);

    // 외부에서 강제 재평가
    const refreshAuth = evaluate;

    return (
        <AuthContext.Provider
            value={{ ...state, refreshAuth: evaluate, logOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}
