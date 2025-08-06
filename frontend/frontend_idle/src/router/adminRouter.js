import { lazy } from "react";
import { Navigate } from "react-router-dom";

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
const LoginComponent = lazy(() => import("../layouts/components/admin/LoginComponent"));
const ActiveChatSessionsList = lazy(() => import("../layouts/components/chat/ActiveChatSessionsList"));

const adminRoutes = [
    { path: "dashboard", element: <DashboardComponent /> },
    {
        path: "admin-accounts",
        children: [
            { index: true, element: <AdminAccountListComponent /> },
            { path: "create", element: <AdminAccountCreateComponent /> },
        ],
    },
    {
        path: "customer-accounts",
        children: [
            { index: true, element: <CustomerAccountListComponent /> },
            { path: "create", element: <CustomerAccountCreateComponent /> },
        ],
    },
    {
        path: "sales",
        children: [
            { index: true, element: <SalesDetailComponent /> },
            { path: "settlement", element: <SalesSettlementComponent /> },
        ],
    },
    {
        path: "inquiries",
        children: [
            { index: true, element: <InquiryListComponent /> },
            { path: "my-inquiries", element: <MyInquiriesComponent /> },
            { path: "chat-sessions", element: <ActiveChatSessionsList /> },
        ],
    },
    {
        path: "notices",
        children: [
            { index: true, element: <NoticeListComponent /> },
            { path: "faq", element: <FAQManagementComponent /> },
        ],
    },
    { path: "login", element: <LoginComponent /> },
];

export default adminRoutes;