import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAdminAuth } from "../../api/adminAuthAPI";
import { adminLogin, adminLogout } from "../../slices/adminLoginSlice";
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
    const dispatch = useDispatch();

    // 초기 로드 시 인증 상태 확인
    useEffect(() => {
        const verifyAdminAuth = async () => {
            try {
                const userData = await checkAdminAuth();
                dispatch(adminLogin({ adminId: userData.adminId, name: userData.name }));
            } catch (error) {
                dispatch(adminLogout());
                if (location.pathname !== '/admin/login') {
                    navigate("/admin/login");
                }
            }
        };

        if (!adminLoginState.isAuthenticated) {
            verifyAdminAuth();
        }
    }, [dispatch, navigate, location.pathname, adminLoginState.isAuthenticated]);


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
        if (!adminLoginState.isAuthenticated && location.pathname !== '/admin/login') {
            navigate("/admin/login");
        }
        // 로그인되어 있고, 현재 경로가 /admin/login 일 때만 대시보드로 리다이렉트
        // 이렇게 하면 로그인 성공 후 로그인 페이지에 머무르지 않고 대시보드로 이동합니다.
        else if (adminLoginState.isAuthenticated && location.pathname === '/admin/login') {
            navigate("/admin/dashboard", { replace: true });
        }
    }, [adminLoginState.isAuthenticated, navigate, location.pathname]);

    const isLoginPage = location.pathname === '/admin/login';

    return (
        <div>
            <AdminHeaderComponent toggleSidebar={toggleSidebar} />
            {!isLoginPage && (
                <SideBarComponent
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
            )}
            <MainContentComponent isSidebarOpen={!isLoginPage ? isSidebarOpen : false}>
                <Outlet />
            </MainContentComponent>
        </div>
    );
};

export default AdminPage;