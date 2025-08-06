import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import adminRoutes from "./adminRouter"; // adminRoutes import
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


const root = createBrowserRouter([
    {
        path: "",
        element: (
            <Suspense fallback={Loading}>
                <Main />
            </Suspense>
        ),
    },
    {
        path: "carPage",
        element: (
            <Suspense fallback={Loading}>
                <DashPage />
            </Suspense>
        ),
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
        path: "/order",
        element: (
            <Suspense fallback={Loading}>
                <OrderForm />
            </Suspense>
        ),
    },
    {
        path: "board",
        element: (
            <Suspense fallback={Loading}>
                <OrderBoard />
            </Suspense>
        ),
    },
    {
        path: "login",
        element: (
            <Suspense fallback={Loading}>
                <Login />
            </Suspense>
        ),
    },
    {
        path: "signup",
        element: (
            <Suspense fallback={Loading}>
                <Singup />
            </Suspense>
        ),
    },
    {
        path: "dstest",
        element: (
            <Suspense fallback={Loading}>
                <Dstest />
            </Suspense>
        ),
    },
]);

export default root;
