import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
    AdminHeaderComponent,
    SideBarComponent,
    MainContentComponent,
} from "../../layouts/components/admin";

const AdminPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 767);

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
