import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import shipperRouter from "./shipperRouter";

const Loading = <div>Loading 중...</div>;

const Main = lazy(() => import("../pages/mainpage/MainPage"));
const DashPage = lazy(() => import("../pages/carOwnerPage/DashBoard"));

const Admin = lazy(() => import("../pages/adminPage/AdminPage"));

const OrderForm = lazy(() => import("../pages/orderPage/OrderForm"));
const Login = lazy(() => import("../pages/loginpage/LoginPage"));
const Singup = lazy(() => import("../pages/signuppage/SignupPage"));
const Dstest = lazy(() => import("../pages/mainpage/TestPage"));
const Shipper = lazy(() => import("../pages/shipperPage/ShipperDashBoard"));

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
    {
        path: "shipper",
        element: (
            <Suspense fallback={Loading}>
                <Shipper />
            </Suspense>
        ),
        children: shipperRouter(),
    },
]);

export default root;
