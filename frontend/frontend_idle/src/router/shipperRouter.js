import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

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
    const ShipperDetails = lazy(() =>
        import("../pages/shipperPage/ShipperDetailsPage")
    );
    const ShipperPayment = lazy(() =>
        import("../pages/shipperPage/ShipperPaymentPage")
    );
    const ShipperReview = lazy(() =>
        import("../pages/shipperPage/ShipperReviewPage")
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
            path: "details",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperDetails />
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
            path: "review",
            element: (
                <Suspense fallback={Loading}>
                    <ShipperReview />
                </Suspense>
            ),
        },
    ];
};

export default shipperRouter;
