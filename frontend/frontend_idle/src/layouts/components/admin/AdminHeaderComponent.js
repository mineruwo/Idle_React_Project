import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { adminLogout } from "../../../slices/adminLoginSlice";
import './AdminHeaderComponent.css';

const AdminHeaderComponent = ({ toggleSidebar }) => {
    const { isAuthenticated, adminName, role } = useSelector((state) => state.adminLogin);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [hideHeader, setHideHeader] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleLogout = () => {
        dispatch(adminLogout()).then(() => {
            navigate("/admin/login");
        });
    };

    const roleToKorean = {
        ALL_PERMISSION: '전체 관리자',
        DEV_ADMIN: '개발 관리자',
        ADMIN: '일반 관리자',
        MANAGER_COUNSELING: '상담 매니저',
        COUNSELOR: '상담원'
    };

    const koreanRole = roleToKorean[role] || role; // 매핑되지 않은 경우 기존 role 표시

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            if (currentY > lastScrollY && currentY > 80) {
                setHideHeader(true);
            } else {
                setHideHeader(false);
            }

            setLastScrollY(currentY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`navbar navbar-expand-lg sticky-top bg-primary 
                transition-top ${hideHeader ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container-fluid admin-header-container">
                <div className="header-left-section">
                    <button className="admin-header-hamburger" onClick={toggleSidebar}>
                        &#9776;
                    </button>
                    <a href="/admin/dashboard" className="navbar-brand">
                        Idle
                    </a>
                </div>

                <div className="header-right-section">
                    {isAuthenticated ? (
                        <>
                            <span className="user-info">{adminName}_{koreanRole}</span>
                            <button className="nav-link logout-btn" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link to="/admin/login/" className="nav-link">
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default AdminHeaderComponent;

