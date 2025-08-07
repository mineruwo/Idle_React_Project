import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    AdminHeaderComponent,
    SideBarComponent,
    MainContentComponent,
} from "../../layouts/components/admin";

const AdminPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 767);
    const navigate = useNavigate();
    const location = useLocation();
    const adminLoginState = useSelector((state) => state.adminLogin);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 767) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // 인증 및 리다이렉션 로직
    useEffect(() => {
        // 로그인되어 있지 않고, 현재 경로가 /admin/login이 아닐 때만 로그인 페이지로 리다이렉트
        if (!adminLoginState.id && location.pathname !== '/admin/login') {
            navigate("/admin/login");
        } 
        // 로그인되어 있고, 현재 경로가 정확히 /admin 일 때만 대시보드로 리다이렉트
        else if (adminLoginState.id && location.pathname === '/admin') {
            navigate("/admin/dashboard", { replace: true });
        }
    }, [adminLoginState.id, navigate, location.pathname]);

    return (
        <div>
            <AdminHeaderComponent toggleSidebar={toggleSidebar} />
            <SideBarComponent
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <MainContentComponent isSidebarOpen={isSidebarOpen}>
                <Outlet />
            </MainContentComponent>
        </div>
    );
};

export default AdminPage;
