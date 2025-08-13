import { lazy, Suspense } from "react";
import {
    createBrowserRouter,
    Outlet,
    useLocation,
    Navigate,
} from "react-router-dom";
import adminRoutes from "./adminRouter";
import FloatingChatButton from "../layouts/components/common/FloatingChatButton";
import OrderBoard from "../pages/orderPage/OrderBoard";
import shipperRouter from "./shipperRouter";
import { RedirectIfAuthed, RequireAuth } from "./RouteGuards";

const Loading = <div>Loading 중...</div>;

// 페이지 컴포넌트 import
const Main = lazy(() => import("../pages/mainpage/MainPage"));
const OrderForm = lazy(() => import("../pages/orderPage/OrderForm"));
const Login = lazy(() => import("../pages/loginpage/LoginPage"));
const Signup = lazy(() => import("../pages/signuppage/SignupPage"));
const AdminPage = lazy(() => import("../pages/adminPage/AdminPage"));
const Shipper = lazy(() => import("../pages/shipperPage/ShipperDashBoard"));

const CarPage = lazy(() => import("../pages/carOwnerPage/CarPage"));
const CarDashPage = lazy(() => import("../pages/carOwnerPage/DashBoard"));
const Order = lazy(() => import("../pages/carOwnerPage/Orders"));
const Profile = lazy(() => import("../pages/carOwnerPage/Profile"));
const EditProfile = lazy(() => import("../pages/carOwnerPage/EditProfile"));
const SubmitDOC = lazy(() => import("../pages/carOwnerPage/SubmitDOC"));
const Settlement = lazy(() => import("../pages/carOwnerPage/Settlement"));
const Vehicles = lazy(()=> import("../pages/carOwnerPage/Vehicles"));


// 최상위 레이아웃 컴포넌트
const RootLayout = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <Suspense fallback={Loading}>
            <Outlet /> {/* 자식 라우트가 렌더링될 위치 */}
            {!isAdminPage && <FloatingChatButton />}{" "}
            {/* 관리자 페이지가 아닐 때만 렌더링 */}
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
            // 게스트
            {
                path: "login",
                element: <RedirectIfAuthed><Login /></RedirectIfAuthed>,
            },
            {
                path: "signup",
                element: <RedirectIfAuthed><Signup /></RedirectIfAuthed>,
            },
            // 차주
            {
                path: "carPage",
                element: (
                    <RequireAuth roles={["carrier"]}>
                        <CarPage />
                    </RequireAuth>
                ),
                children: [
                    {
                        index: true,
                        element: <Navigate to="DashBoard" replace />,
                    },
                    {
                        path: "DashBoard",
                        element: (
                            <Suspense fallback={Loading}>
                                <CarDashPage />
                            </Suspense>
                        ),
                    },
                    {
                        path: "profile",
                        element: (
                            <Suspense fallback={Loading}>
                                <Profile />
                            </Suspense>
                        ),
                    },
                    {
                        path: "editProfile",
                        element: (
                            <Suspense fallback={Loading}>
                                <EditProfile />
                            </Suspense>
                        ),
                    },
                    {
                        path: "orders",
                        element: (
                            <Suspense fallback={Loading}>
                                <Order />
                            </Suspense>
                        ),
                    },
                    {
                        path: "settlement",
                        element: (
                            <Suspense fallback={Loading}>
                                <Settlement />
                            </Suspense>
                        ),
                    },
                    {
                        path: "vehicles",
                        element: (
                            <Suspense fallback={Loading}>
                                <Vehicles/>
                            </Suspense>
                        ),
                    },
                    {
                        path: "submitDOC",
                        element: (
                            <Suspense fallback={Loading}>
                                <SubmitDOC />
                            </Suspense>
                        ),
                    },
                ],
            },
            // 관리자
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
                path: "board",
                element: <OrderBoard />,
            },
        ],
    },
    // 화주
    {
        path: "shipper",
        element: (
            <RequireAuth roles={["shipper"]}>
                <Suspense fallback={Loading}><Shipper /></Suspense>
            </RequireAuth>
        ),
        children: shipperRouter(),
    },
]);

export default root;
