import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import useCustomMove from "../hooks/useCustomMove";
import { useEffect } from "react";

export function RequireAuth({ children, roles }) {
    const { loading, authenticated, profile } = useAuth();
    const location = useLocation();
    const { moveToLoginPage, moveToMyPageByRole } = useCustomMove();

    const shouldGoLogin = !loading && !authenticated;
    const roleMismatch =
        !loading &&
        authenticated &&
        roles &&
        !roles.includes(profile?.role);

    // 게스트 -> 로그인
    useEffect(() => {
        if (shouldGoLogin) {
            moveToLoginPage({ replace: true, state: { from: location } });
        }
    }, [shouldGoLogin, moveToLoginPage, location]);


    // 역할 불일치 → 내 역할 홈으로
    useEffect(() => {
        if (roleMismatch) {
            moveToMyPageByRole(profile?.role, { replace: true });
        }
    }, [roleMismatch, profile?.role, moveToMyPageByRole]);

    if (loading) return null;
    if (shouldGoLogin || roleMismatch) return null; // 이동 중엔 렌더 안 함

    return children;
}

export function RedirectIfAuthed({ children }) {
    const { loading, authenticated, profile } = useAuth();
    const { moveToMyPageByRole } = useCustomMove();

    useEffect(() => {
        if (!loading && authenticated) {
            moveToMyPageByRole(profile?.role, { replace: true });
        }
    }, [loading, authenticated, profile?.role, moveToMyPageByRole]);

    if (loading) return null;
    if (authenticated) return null;

    return children;
}