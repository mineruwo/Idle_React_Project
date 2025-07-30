import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

const shipperRouter = () => {
    const Loading = <div>Loading 중...</div>;

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
        import("../pages/shipperPage/ShipperPaymentPage")
    );
    const ShippingStatus = lazy(() =>
        import("../pages/shipperPage/ShippingStatusPage")
    );

    return [
        {
            path: "",
            element: <Navigate replace to="/shipper" />,
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
        {
            path: "status",
            element: (
                <Suspense fallback={Loading}>
                    <ShippingStatus />
                </Suspense>
            ),
        },
    ];
};

export default shipperRouter;
