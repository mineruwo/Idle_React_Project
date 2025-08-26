import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import useWindowSize from "../../hooks/useWindowSize";
import useAuth from "../../hooks/useAuth";
import {
    AdminHeaderComponent,
    SideBarComponent,
    MainContentComponent,
    Overlay,
} from "../../layouts/components/admin";

const AdminPage = () => {
    const { width } = useWindowSize();
    const { status } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(width > 767);

    useEffect(() => {
        setIsSidebarOpen(width > 767);
    }, [width]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (status === 'loading' || status === 'idle') {
        return <div>Loading...</div>;
    }

    const isLoginPage = location.pathname === '/admin/login';
    const shouldShrinkHeader = isSidebarOpen && width > 767 && !isLoginPage;
    const showOverlay = isSidebarOpen && width <= 767;
    const mainContentSidebarOpen = !isLoginPage && isSidebarOpen;

    return (
        <div>
            <AdminHeaderComponent toggleSidebar={toggleSidebar} shrinkHeader={shouldShrinkHeader} />
            {!isLoginPage && (
                <SideBarComponent
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                />
            )}
            {showOverlay && <Overlay onClick={toggleSidebar} />}
            <MainContentComponent isSidebarOpen={mainContentSidebarOpen}>
                <Outlet />
            </MainContentComponent>
        </div>
    );
};

export default AdminPage;
