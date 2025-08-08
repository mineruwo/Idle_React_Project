import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "../../slices/adminLoginSlice";
import {
    AdminHeaderComponent,
    SideBarComponent,
    MainContentComponent,
} from "../../layouts/components/admin";

const AdminPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 767);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, status } = useSelector((state) => state.adminLogin);
    const dispatch = useDispatch();

    useEffect(() => {
        // Only check auth status if it hasn't been checked yet
        if (status === 'idle') {
            dispatch(checkAuthStatus());
        }
    }, [status, dispatch]);

    useEffect(() => {
        // Redirect logic based on authentication status
        if (status === 'succeeded' && isAuthenticated && location.pathname === '/admin/login') {
            navigate("/admin/dashboard", { replace: true });
        } else if (status === 'failed' && !isAuthenticated && location.pathname !== '/admin/login') {
            navigate("/admin/login");
        }
    }, [isAuthenticated, status, navigate, location.pathname]);

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Render a loading indicator while checking auth status
    if (status === 'loading' || status === 'idle') {
        return <div>Loading...</div>; // Or a more sophisticated spinner component
    }

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
