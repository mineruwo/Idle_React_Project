import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../../slices/adminLoginSlice";
import useScrollDirection from "../../../hooks/useScrollDirection";
import './AdminHeaderComponent.css';

// This could be moved to a more centralized location, e.g. a constants file.
const ROLE_MAP = {
    ALL_PERMISSION: '전체 관리자',
    DEV_ADMIN: '개발 관리자',
    ADMIN: '일반 관리자',
    MANAGER_COUNSELING: '상담 매니저',
    COUNSELOR: '상담원'
};

const AuthenticatedUser = ({ adminName, role, onLogout }) => {
    const koreanRole = ROLE_MAP[role] || role;

    return (
        <>
            <span className="user-info">{adminName}_{koreanRole}</span>
            <button className="nav-link logout-btn" onClick={onLogout}>
                로그아웃
            </button>
        </>
    );
};

const AdminHeaderComponent = ({ toggleSidebar, shrinkHeader }) => {
    const { isAuthenticated, adminName, role } = useSelector((state) => state.adminLogin);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const scrollDirection = useScrollDirection();

    const handleLogout = () => {
        dispatch(adminLogout()).then(() => {
            navigate("/admin/login");
        });
    };

    const isHeaderHidden = scrollDirection === "down";

    return (
        <nav
            className={`navbar navbar-expand-lg sticky-top bg-primary ${shrinkHeader ? 'admin-header-nav' : ''}
                transition-top ${isHeaderHidden ? "hide" : ""}`}
            data-bs-theme="light"
        >
            <div className="container-fluid admin-header-container">
                <div className="header-left-section">
                    <button className="admin-header-hamburger" onClick={toggleSidebar}>
                        &#9776;
                    </button>
                </div>

                <div className="header-right-section">
                    {isAuthenticated ? (
                        <AuthenticatedUser adminName={adminName} role={role} onLogout={handleLogout} />
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

