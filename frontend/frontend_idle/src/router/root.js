import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

const Loading = <div>Loading 중...</div>

const Main = lazy(()=> import("../mainpage/pages/MainPage"));

const root = createBrowserRouter([
    {
        path:"",
        element:<Suspense fallback={Loading}><Main/></Suspense>
    }
]);

export default root;