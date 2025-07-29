import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중...</div>

const Main = lazy(() => import("../mainpage/pages/MainPage"));
const Login = lazy(() => import("../loginpage/pages/LoginPage"));
const Singup = lazy(() => import("../signuppage/pages/SignupPage"));
const Dstest = lazy(() => import("../mainpage/pages/TestPage"));

const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><Main /></Suspense>
    },
    {
        path: "login",
        element: <Suspense fallback={Loading}><Login /></Suspense>
    },
    {
        path: "signup",
        element: <Suspense fallback={Loading}><Singup /></Suspense>
    },
    {
        path: "dstest",
        element: <Suspense fallback={Loading}><Dstest /></Suspense>
    }
]);

export default root;