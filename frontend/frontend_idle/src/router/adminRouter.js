import { lazy } from "react";
import { Outlet } from "react-router-dom"; // Outlet 임포트
import ProtectedRoute from "./ProtectedRoute"; // ProtectedRoute 임포트

const DashboardComponent = lazy(() => import("../layouts/components/admin/DashboardComponent"));
const AdminAccountListComponent = lazy(() => import("../layouts/components/admin/AdminAccountListComponent"));
const AdminAccountCreateComponent = lazy(() => import("../layouts/components/admin/AdminAccountCreateComponent"));
const CustomerAccountListComponent = lazy(() => import("../layouts/components/admin/CustomerAccountListComponent"));
const CustomerAccountCreateComponent = lazy(() => import("../layouts/components/admin/CustomerAccountCreateComponent"));
const SalesDetailComponent = lazy(() => import("../layouts/components/admin/SalesDetailComponent"));
const SalesSettlementComponent = lazy(() => import("../layouts/components/admin/SalesSettlementComponent"));
const InquiryListComponent = lazy(() => import("../layouts/components/admin/InquiryListComponent"));
const MyInquiriesComponent = lazy(() => import("../layouts/components/admin/MyInquiriesComponent"));
const NoticeListComponent = lazy(() => import("../layouts/components/admin/NoticeListComponent"));
const FAQManagementComponent = lazy(() => import("../layouts/components/admin/FAQManagementComponent"));
const NoticeCreateComponent = lazy(() => import("../layouts/components/admin/NoticeCreateComponent"));
const NoticeEditComponent = lazy(() => import("../layouts/components/admin/NoticeEditComponent")); // Import the new component
const FAQCreateComponent = lazy(() => import("../layouts/components/admin/FAQCreateComponent"));
const FAQEditComponent = lazy(() => import("../layouts/components/admin/FAQEditComponent")); // Import the new component
const LoginComponent = lazy(() => import("../layouts/components/admin/LoginComponent"));
const ActiveChatSessionsList = lazy(() => import("../layouts/components/chat/ActiveChatSessionsList"));

const adminRoutes = [
    { 
        index: true, 
        element: <ProtectedRoute><DashboardComponent /></ProtectedRoute> 
    },
    { 
        path: "dashboard", 
        element: <ProtectedRoute><DashboardComponent /></ProtectedRoute> 
    },
    {
        path: "admin-accounts",
        element: <ProtectedRoute requiredRoles={['DEV_ADMIN']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <AdminAccountListComponent /> },
            { path: "create", element: <AdminAccountCreateComponent /> },
        ],
    },
    {
        path: "customer-accounts",
        element: <ProtectedRoute requiredRoles={['ADMIN']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <CustomerAccountListComponent /> },
            { path: "create", element: <CustomerAccountCreateComponent /> },
        ],
    },
    {
        path: "sales",
        element: <ProtectedRoute requiredRoles={['ADMIN']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <SalesDetailComponent /> },
            { path: "settlement", element: <SalesSettlementComponent /> },
        ],
    },
    {
        path: "inquiries",
        element: <ProtectedRoute requiredRoles={['MANAGER_COUNSELING', 'COUNSELOR']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <InquiryListComponent /> },
            { path: "my-inquiries", element: <MyInquiriesComponent /> },
            { path: "chat-sessions", element: <ActiveChatSessionsList /> },
        ],
    },
    {
        path: "notices",
        element: <ProtectedRoute requiredRoles={['MANAGER_COUNSELING']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <NoticeListComponent /> },
            { path: "create", element: <NoticeCreateComponent /> },
            { path: "edit/:id", element: <NoticeEditComponent /> }, // Add the new route
        ],
    },
    {
        path: "faqs",
        element: <ProtectedRoute requiredRoles={['MANAGER_COUNSELING']}><Outlet /></ProtectedRoute>,
        children: [
            { index: true, element: <FAQManagementComponent /> },
            { path: "create", element: <FAQCreateComponent /> },
            { path: "edit/:id", element: <FAQEditComponent /> }, // Add the new route
        ],
    },
        { path: "login", element: <LoginComponent /> },
];

export default adminRoutes;