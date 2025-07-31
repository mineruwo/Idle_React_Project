import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { adminLogin, adminLogout } from "../../../slices/adminLoginSlice";

const AdminHeaderComponent = () => {
    const adminLoginState = useSelector((state) => state.adminLogin);
    const dispatch = useDispatch();

    const [hideHeader, setHideHeader] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleLogout = () => {
        dispatch(adminLogout());
    };

    const handleLogin = () => {
        dispatch(adminLogin());
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            if (currentY > lastScrollY && currentY > 80) {
                setHideHeader(true); // 아래로 스크롤하면 숨김
            } else {
                setHideHeader(false); // 위로 스크롤하면 보임
            }

            setLastScrollY(currentY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={`navbar navbar-expand-lg sticky-top bg-primary 
                transition-top ${hideHeader ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container">
                <a href="../" className="navbar-brand">
                    핑크 성남운송
                </a>

                <div className="collapse navbar-collapse" id="navbarResponsive">
                    <ul className="navbar-nav ms-md-auto">
                        <li className="nav-item">
                            <Link to="/admin/login/" className="nav-link">
                                로그인
                            </Link>
                            {!adminLoginState.id ? (
                                <button type="button" onClick={handleLogin}>
                                    로그인
                                </button>
                            ) : (
                                <button type="button" onClick={handleLogout}>
                                    로그아웃
                                </button>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default AdminHeaderComponent;
