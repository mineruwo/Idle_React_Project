import React, { useState, useEffect } from 'react';
import AdminHeaderComponent from "../../layouts/components/admin/AdminHeaderComponent";
import SidebarComponent from '../../layouts/components/admin/SidebarComponent';
import MainContentComponent from '../../layouts/components/admin/MainContentComponent';
import LoginComponent from '../../layouts/components/admin/LoginComponent';

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

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div>
            <AdminHeaderComponent />
            <SidebarComponent isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <MainContentComponent isSidebarOpen={isSidebarOpen}>
                <LoginComponent/>
            </MainContentComponent>
        </div>
    );
}

export default AdminPage;