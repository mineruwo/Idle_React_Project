import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const Loading = <div>Loading 중...</div>;
//Main
const Main = lazy(() => import("../pages/mainpage/MainPage"));

//CarOwner
const CarPage = lazy(() => import("../pages/carOwnerPage/CarPage"));
const CarDashPage = lazy(() => import("../pages/carOwnerPage/DashBoard"));
const Order = lazy(() => import("../pages/carOwnerPage/Orders"));
const Profile = lazy(() => import("../pages/carOwnerPage/Profile"));
const EditProfile = lazy(() => import("../pages/carOwnerPage/EditProfile"));
const SubmitDOC = lazy(() => import("../pages/carOwnerPage/SubmitDOC"));
const Settlement = lazy(() => import("../pages/carOwnerPage/Settlement"));
const Vehicles = lazy(() => import("../pages/carOwnerPage/Vehicles"));
//Admin
const Admin = lazy(() => import("../pages/adminPage/AdminPage"));

const OrderForm = lazy(() => import("../pages/orderPage/OrderForm"));
const Login = lazy(() => import("../pages/loginpage/LoginPage"));
const Signup = lazy(() => import("../pages/signuppage/SignupPage"));
const Dstest = lazy(() => import("../pages/mainpage/TestPage"));


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
        path: 'carPage',
        element: (
            <Suspense fallback={Loading}>
                <CarPage />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="DashBoard" replace />,
            },
            {
                path: 'DashBoard',
                element: (
                    <Suspense fallback={Loading}>
                        <CarDashPage />
                    </Suspense>
                ),
            },
            {
                path: 'profile',
                element: (
                    <Suspense fallback={Loading}>
                        <Profile />
                    </Suspense>
                ),

            },
            {
                path: 'editProfile',
                element: (
                    <Suspense fallback={Loading}>
                        <EditProfile />
                    </Suspense>
                )
            },
            {
                path: 'orders',
                element: (
                    <Suspense fallback={Loading}>
                        <Order />
                    </Suspense>
                ),
            },
            {
                path: 'settlement',
                element: (
                    <Suspense fallback={Loading}>
                        <Settlement />
                    </Suspense>
                ),
            },
            {
                path: 'vehucles',
                element: (
                    <Suspense fallback={Loading}>
                        <Vehicles />
                    </Suspense>
                ),
            },
             {
                path: 'submitDOC',
                element: (
                    <Suspense fallback={Loading}>
                        <SubmitDOC />
                    </Suspense>
                ),
            },
        ],
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
                <Signup />
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
