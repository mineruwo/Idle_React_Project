import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";


const Loading = <div>Loading 중...</div>

const Main = lazy(()=> import("../mainpage/pages/MainPage"));
const DashPage = lazy(()=> import("../Car_owner/pages/DashBoard"));

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><Main/></Suspense>
    },
    {
        path:"carPage",
        element:<Suspense fallback={Loading}><DashPage/></Suspense>
    }
]);

export default root;