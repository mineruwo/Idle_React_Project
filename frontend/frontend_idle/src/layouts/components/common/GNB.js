import { useCallback, useEffect, useRef, useState } from "react";
import "../../../theme/GNB.css";
import BubbleAnimation from "../carownerComponent/common/BubbleAnimation";
import { clearAccessToken, getAccessToken } from "../../../auth/tokenStore";
import api from "../../../api/authApi";
import { getRoleFromToken } from "../../../utils/jwt";
import useCustomMove from "../../../hooks/useCustomMove";
import { useAuth } from "../../../auth/AuthProvider";

const GNB = () => {
    const [hideHeader, setHideHeader] = useState(false);

    const { loading, authenticated, profile, refreshAuth, logOut } = useAuth();

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

    const role = profile?.role || getRoleFromToken(getAccessToken());

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
            logOut();
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
                        {!authenticated ? (
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
