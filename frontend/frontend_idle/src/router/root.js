import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중...</div>;

const Main = lazy(() => import("../mainpage/pages/MainPage"));
const DashPage = lazy(() => import("../Car_owner/pages/DashBoard"));

const Admin = lazy(() => import("../../src/mainpage/admin/AdminPage"));

const OrderForm = lazy(() => import("../orderPage/OrderForm"));
const Login = lazy(() => import("../loginpage/pages/LoginPage"));
const Singup = lazy(() => import("../signuppage/pages/SignupPage"));
const Dstest = lazy(() => import("../mainpage/pages/TestPage"));

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
        path: "admin_PinkTruck",
        element: (
            <Suspense fallback={Loading}>
                <Admin />
            </Suspense>
        ),
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
