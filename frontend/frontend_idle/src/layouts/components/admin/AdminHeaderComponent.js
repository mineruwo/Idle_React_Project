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
            <div className="container">
                <a href="../" className="navbar-brand">
                    핑크 성남운송
                </a>

                <div className="d-flex ms-auto">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            {adminLoginState.id ? (
                                <button className="nav-link" onClick={handleLogout}>
                                    로그아웃
                                </button>
                            ) : (
                                <Link to="/admin/login/" className="nav-link">
                                    로그인
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
export default AdminHeaderComponent;
