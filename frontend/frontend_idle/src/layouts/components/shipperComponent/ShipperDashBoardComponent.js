import { useEffect, useState } from "react";
import useCustomMove from "../../../hooks/useCustomMove";
import "../../../theme/ShipperCustomCss/ShipperDashBoard.css";
import ShippingStatusComponent from "./ShippingStatusComponent";
import { fetchUserPoints } from "../../../api/paymentApi";
import ShipperReviewDashboard from "./ShipperReviewDashboard";
import { fetchMyOrders } from "../../../api/orderApi";

const ShipperDashBoardComponent = (userId) => {
    const { shipperMoveToPoint, shipperMoveToOrderHistory } = useCustomMove();

    const [currentPoints, setCurrentPoints] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [inProgressOrders, setInProgressOrders] = useState(0);
    const [completedOrders, setCompletedOrders] = useState(0);
    const [cancelledOrders, setCancelledOrders] = useState(0);

    useEffect(() => {
        const loadOrderCounts = async () => {
            try {
                const allOrders = await fetchMyOrders();
                let created = 0;
                let paymentPending = 0;
                let ready = 0;
                let ongoing = 0;
                let completed = 0;
                let cancelled = 0;

                allOrders.forEach(order => {
                    switch (order.status) {
                        case 'CREATED':
                            created++;
                            break;
                        case 'PAYMENT_PENDING':
                            paymentPending++;
                            break;
                        case 'READY':
                            ready++;
                            break;
                        case 'ONGOING':
                            ongoing++;
                            break;
                        case 'COMPLETED':
                            completed++;
                            break;
                        case 'CANCELLED': // Assuming 'CANCELLED' is a possible status
                            cancelled++;
                            break;
                        default:
                            break;
                    }
                });

                setTotalOrders(allOrders.length);
                setInProgressOrders(created + paymentPending + ready + ongoing);
                setCompletedOrders(completed);
                setCancelledOrders(cancelled);

            } catch (error) {
                console.error("Failed to fetch order counts:", error);
                // Optionally set error state for display
            }
        };

        loadOrderCounts();
    }, []); // Empty dependency array to run once on mount

    useEffect(() => {
        const getUserPoints = async () => {
            try {
                const response = await fetchUserPoints();
                setCurrentPoints(response.points);
            } catch (error) {
                console.error("Failed to fetch user points:", error);
            }
        };

        getUserPoints();
    }, [userId]);

    return (
        <div className="dashboard">
            <div className="dashboard-row-3">
                <div className="card">
                    <div className="card-title">오더상세</div>
                    <div className="card-content">{totalOrders}건</div>
                    <div className="card-desc">
                        최근 오더: 진행중 {inProgressOrders}, 완료 {completedOrders}, 취소 {cancelledOrders}
                    </div>
                    <div className="card-action" onClick={shipperMoveToOrderHistory}>
                        상세보기
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">포인트</div>
                    <div className="card-content">
                        {currentPoints.toLocaleString()}P
                    </div>
                    <div className="card-action" onClick={shipperMoveToPoint}>
                        포인트 내역
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">내 문의 내역</div>
                    <div className="card-content">3건</div>
                    <div className="card-desc">
                        최근 문의: 답변 완료 2, 답변 대기 1
                    </div>
                    <div className="card-action">
                        상세보기
                    </div>
                </div>
            </div>
            <div className="dashboard-row-1">
                {/* 새로운 후기 관리 컴포넌트를 여기에 추가 */}
                <ShipperReviewDashboard />
            </div>
            <div className="dashboard-row-1">
                <div className="card card-full-width">
                    <div className="card-title">운송현황</div>
                    <ShippingStatusComponent />
                </div>
            </div>
        </div>
    );
};

export default ShipperDashBoardComponent;
