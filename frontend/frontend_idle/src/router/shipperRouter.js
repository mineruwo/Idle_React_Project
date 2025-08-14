import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import ShipperPointComponent from "../layouts/components/shipperComponent/ShipperPointComponent";

const shipperRouter = () => {
    const Loading = <div>Loading 중...</div>;

    const ShipperDashBoard = lazy(() =>
        import(
            "../layouts/components/shipperComponent/ShipperDashBoardComponent"
        )
    );
    const ShipperOrder = lazy(() =>
        import("../pages/shipperPage/ShipperOrderPage")
    );
    const ShipperOrderBoard = lazy(() =>
        import("../pages/shipperPage/ShipperOrderBoardPage")
    );
    const ShipperPayment = lazy(() =>
        import("../pages/shipperPage/ShipperPaymentPage")
    );
    const ShipperReview = lazy(() =>
        import("../pages/shipperPage/ShipperReviewPage")
    );
    const ShipperPoint = lazy(() =>
        import("../pages/shipperPage/ShipperPointPage")
    );
    const ShipperPaymentSuccess = lazy(() =>
        import("../pages/shipperPage/ShipperPaymentSuccessPage")
    );

    const ShipperOrderHistory = lazy(() =>
        import("../pages/shipperPage/ShipperOrderHistoryPage")
    );

    return [
        {
            index: true,
            element: (
                <Suspense fallback={Loading}>
                    <ShipperDashBoard />
                </Suspense>
            ),
        },
        {
            path: "order",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperOrder />
                </Suspense>
            ),
        },
        {
            path: "orderBoard",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperOrderBoard />
                </Suspense>
            ),
        },
        {
            path: "payment",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperPayment />
                </Suspense>
            ),
        },
        {
            path: "payment/success",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperPaymentSuccess />
                </Suspense>
            ),
        },
        {
            path: "review",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperReview />
                </Suspense>
            ),
        },
        {
            path: "point",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperPoint />
                </Suspense>
            ),
        },
        {
            path: "orderHistory",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperOrderHistory />
                </Suspense>
            ),
        },
    ];
};

export default shipperRouter;
