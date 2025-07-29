import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중...</div>;

// 각 페이지 컴포넌트를 lazy 로딩
const Main = lazy(() => import("../mainpage/pages/MainPage"));
const OrderForm = lazy(() => import("../orderPage/OrderForm"));

const root = createBrowserRouter([
  {
    path: "",
    element: <Suspense fallback={Loading}><Main /></Suspense>,
  },
  {
    path: "/order",
    element: <Suspense fallback={Loading}><OrderForm /></Suspense>,
  }
]);

export default root;