import { lazy, Suspense } from "react";

const Loading = <div>Loding....</div>;
const Login = lazy(()=>import("패스 예정"));
const Logout = lazy(()=>import("패스 예정"));
const DashBoard = lazy(()=>import("패스 예정"));

const adminRouter = ()=>
    {

        return[
            {
                path:"login",
                element:<Suspense fallback={Loading}><Login/></Suspense>
            },
            {
                path:"logout",
                element:<Suspense fallback={Loading}><Logout/></Suspense>
            },

            {
                path:"dashboard",
                element:<Suspense fallback={Loading}><DashBoard/></Suspense>
            },

            {
                path:"login",
                element:<Suspense fallback={Loading}><Login/></Suspense>
            },

            {
                path:"login",
                element:<Suspense fallback={Loading}><Login/></Suspense>
            },

            {
                path:"login",
                element:<Suspense fallback={Loading}><Login/></Suspense>
            },


        ]
    }

export default adminRouter;