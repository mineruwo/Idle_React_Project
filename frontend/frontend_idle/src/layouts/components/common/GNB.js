import { useCallback, useEffect, useRef, useState } from "react";
import styles from "../../../theme/GNB.css";
import api from "../../../api/authApi";
import useCustomMove from "../../../hooks/useCustomMove";
import { useAuth } from "../../../auth/AuthProvider";

const GNB = () => {
    const [hideHeader, setHideHeader] = useState(false);
    const { authenticated, profile, logOut } = useAuth();

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

    const role = profile?.role;

    const handleMyPage = useCallback(() => {
        if (role === "shipper") shipperMoveToDashBoard();
        else if (role === "carrier") carOwnerMoveToDashboard();
        else moveToLoginPage();
    }, [role, shipperMoveToDashBoard, carOwnerMoveToDashboard, moveToLoginPage]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout"); 
        } catch (_) {
        } finally {
            logOut();          
            moveToMainPage();  
        }
    };

    return (
        <div
            className={`navbar navbar-expand-lg sticky-top bg-primary 
                ${styles.root} ${hideHeader ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container-fluid">
                <button
                    type="button"
                    className="navbar-brand btn btn-link p-0"
                    onClick={moveToMainPage}
                >
                    <img src="/img/logo/logo.png" alt="" width="50" height="45" />
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
        </div>
    );
};

export default GNB;
