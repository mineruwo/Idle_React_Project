import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../../../theme/GNB.css";
import BubbleAnimation from "../carownerComponent/common/BubbleAnimation";
import { ACCESS_TOKEN_KEY, AUTH_CHANGE_EVENT, clearAccessToken, getAccessToken } from "../../../auth/tokenStore";
import api from "../../../api/authApi";
import { getRoleFromToken } from "../../../utils/jwt";
import useCustomMove from "../../../hooks/useCustomMove";

const GNB = () => {
    const [hideHeader, setHideHeader] = useState(false);

    // !! -> 원래 값을 boolean으로 확실하게 변환
    const [isLoggedIn, setIsLoggedIn] = useState(!!getAccessToken());

    const [role, setRole] = useState(() => {
        const token = getAccessToken();
        return token ? getRoleFromToken(token) : null;
    });

    const {
        shipperMoveToDashBoard,
        carOwnerMoveToDashboard,
        moveToLoginPage,
        moveToMainPage,
        moveToSignUpPage
    } = useCustomMove();

    const lastYRef = useRef(0);

    // 스크롤
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;

            if (y > lastYRef.current && y > 80) setHideHeader(true);
            else setHideHeader(false);
            lastYRef.current = y;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 로그인/로그아웃/다른 탭 동기화
    useEffect(() => {
        const syncAuth = () => {
            const token = getAccessToken();
            setIsLoggedIn(!!token);
            setRole(token ? getRoleFromToken(token) : null);
        };


        const onStorage = (e) => {
            if (e.key === ACCESS_TOKEN_KEY) syncAuth();
        };

        window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
        window.addEventListener("storage", onStorage);

        // 초기 1회 동기화
        syncAuth();

        return () => {
            window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const handleMyPage = useCallback(() => {
        if (role === "shipper") shipperMoveToDashBoard();
        else if (role === "carrier") carOwnerMoveToDashboard();
        else moveToLoginPage();
    }, [role, shipperMoveToDashBoard, carOwnerMoveToDashboard, moveToLoginPage]);

    const handleLogout = async () => {
        try {
            if (api?.post) {
                await api.post("/auth/logout");
            }
        } catch (_) { // 에러 발생해도 UI 유지
        } finally {
            clearAccessToken();
            moveToMainPage();
        }
    };

    return (
        <div
            className={`navbar navbar-expand-lg sticky-top bg-primary 
                transition-top ${hideHeader ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container-fluid">
                <button
                    type="button"
                    className="navbar-brand btn btn-link p-0"
                    onClick={moveToMainPage}
                >
                    idle
                </button>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarResponsive"
                    aria-controls="navbarResponsive"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ms-md-auto align-items-center gap-3">
                        {!isLoggedIn ? (
                            <>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link btn btn-link px-0 py-2"
                                        onClick={moveToLoginPage}
                                    >
                                        로그인
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link btn btn-link px-0 py-2"
                                        onClick={moveToSignUpPage}
                                    >
                                        회원가입
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link btn btn-link px-0 py-2"
                                        onClick={handleMyPage}
                                    >
                                        마이페이지
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        type="button"
                                        className="nav-link btn btn-link px-0 py-2"
                                        onClick={handleLogout}
                                    >
                                        로그아웃
                                    </button>
                                </li>
                            </>
                        )}

                    </ul>
                </div>
            </div>
            <div className="bubblediv">
                <BubbleAnimation warmth={100} />
            </div>
        </div>
    );
};

export default GNB;
