import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet, useLocation, Navigate } from "react-router-dom";
import adminRoutes from "./adminRouter";
import FloatingChatButton from "../layouts/components/common/FloatingChatButton";
import OrderBoard from "../pages/orderPage/OrderBoard";

const Loading = <div>Loading 중...</div>;

// 페이지 컴포넌트 import
const Main = lazy(() => import("../pages/mainpage/MainPage"));
const DashPage = lazy(() => import("../pages/carOwnerPage/DashBoard"));
const OrderForm = lazy(() => import("../pages/orderPage/OrderForm"));
const Login = lazy(() => import("../pages/loginpage/LoginPage"));
const Singup = lazy(() => import("../pages/signuppage/SignupPage"));
const Dstest = lazy(() => import("../pages/mainpage/TestPage"));
const AdminPage = lazy(() => import("../pages/adminPage/AdminPage"));

// 최상위 레이아웃 컴포넌트
const RootLayout = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <Suspense fallback={Loading}>
      <Outlet /> {/* 자식 라우트가 렌더링될 위치 */}
      {!isAdminPage && <FloatingChatButton />} {/* 관리자 페이지가 아닐 때만 렌더링 */}
    </Suspense>
  );
};

const root = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />, // RootLayout을 최상위 element로 사용
        children: [
            {
                index: true,
                element: <Main />,
            },
            {
                path: "carPage",
                element: <DashPage />,
            },
            {
                path: "admin",
                element: (
                    <Suspense fallback={Loading}>
                        <AdminPage />
                    </Suspense>
                ),
                children: adminRoutes,
            },
            {
                path: "order",
                element: <OrderForm />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "signup",
                element: <Singup />,
            },
            {
                path: "dstest",
                element: <Dstest />,
            },
            {
                path: "board",
                element: <OrderBoard/>
            }
        ],
    },
]);

export default root;
