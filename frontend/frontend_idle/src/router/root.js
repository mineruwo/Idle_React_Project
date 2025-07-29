import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중...</div>

const Main = lazy(()=> import("../mainpage/pages/MainPage"));

const Admin = lazy(()=> import("../../src/mainpage/admin/AdminPage"))

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><Main/></Suspense>
    },
    {
        path:"admin_PinkTruck",
        element: <Suspense fallback={Loading}><Admin/></Suspense>

    }
]);

export default root;