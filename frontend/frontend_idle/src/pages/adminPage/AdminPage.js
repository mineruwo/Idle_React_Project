import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminHeaderComponent from "../../layouts/components/admin/AdminHeaderComponent";
import SideBarComponent from "../../layouts/components/admin/SideBarComponent";
import MainContentComponent from "../../layouts/components/admin/MainContentComponent";
import LoginComponent from "../../layouts/components/admin/LoginComponent";
import ActiveChatSessionsList from "../../layouts/components/chat/ActiveChatSessionsList";
import DashboardComponent from "../../layouts/components/admin/pages/DashboardComponent";
import AdminAccountListComponent from "../../layouts/components/admin/pages/AdminAccountListComponent";
import CustomerAccountListComponent from "../../layouts/components/admin/pages/CustomerAccountListComponent";
import InquiryListComponent from "../../layouts/components/admin/pages/InquiryListComponent";
import NoticeListComponent from "../../layouts/components/admin/pages/NoticeListComponent";
import AdminAccountCreateComponent from "../../layouts/components/admin/pages/AdminAccountCreateComponent";
import CustomerAccountCreateComponent from "../../layouts/components/admin/pages/CustomerAccountCreateComponent";
import SalesDetailComponent from "../../layouts/components/admin/pages/SalesDetailComponent";
import SalesSettlementComponent from "../../layouts/components/admin/pages/SalesSettlementComponent";
import MyInquiriesComponent from "../../layouts/components/admin/pages/MyInquiriesComponent";
import FAQManagementComponent from "../../layouts/components/admin/pages/FAQManagementComponent";


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
            <AdminHeaderComponent />
            <SideBarComponent
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <MainContentComponent isSidebarOpen={isSidebarOpen}>
                <Routes>
                    <Route path="/" element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<DashboardComponent />} />

                    {/* 관리자 계정 관리 서브메뉴 */}
                    <Route path="admin-accounts">
                        <Route index element={<AdminAccountListComponent />} />
                        <Route path="create" element={<AdminAccountCreateComponent />} />
                    </Route>

                    {/* 고객 계정 관리 서브메뉴 */}
                    <Route path="customer-accounts">
                        <Route index element={<CustomerAccountListComponent />} />
                        <Route path="create" element={<CustomerAccountCreateComponent />} />
                    </Route>

                    {/* 매출 관리 서브메뉴 */}
                    <Route path="sales">
                        <Route index element={<SalesDetailComponent />} />
                        <Route path="settlement" element={<SalesSettlementComponent />} />
                    </Route>

                    {/* 상담 문의 관리 서브메뉴 */}
                    <Route path="inquiries">
                        <Route index element={<InquiryListComponent />} />
                        <Route path="my-inquiries" element={<MyInquiriesComponent />} />
                        <Route path="chat-sessions" element={<ActiveChatSessionsList />} />
                    </Route>

                    {/* 공지 사항 관리 서브메뉴 */}
                    <Route path="notices">
                        <Route index element={<NoticeListComponent />} />
                        <Route path="faq" element={<FAQManagementComponent />} />
                    </Route>

                    {/* 기존 라우트 (필요에 따라 유지 또는 제거) */}
                    <Route path="login" element={<LoginComponent />} />
                    {/* ActiveChatSessionsList는 이제 inquiries 서브메뉴 아래로 이동 */}
                </Routes>
            </MainContentComponent>
        </div>
    );
};

export default AdminPage;
