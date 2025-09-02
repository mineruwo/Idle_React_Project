import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../theme/ShipperCustomCss/ShipperReviewDashBoard.css";
import { getMyReviews } from "../../../api/reviewApi";
import { fetchMyOrders } from "../../../api/orderApi";

const ShipperReviewDashboard = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingReviews, setPendingReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadReviewData = async () => {
            try {
                const [allOrders, myReviewsData] = await Promise.all([
                    fetchMyOrders(),
                    getMyReviews(),
                ]);

                const reviewedOrderIds = new Set(
                    myReviewsData.map((review) => review.orderId)
                );

                const unreviewedCompletedOrders = allOrders
                    .filter(
                        (order) =>
                            order.status === "COMPLETED" &&
                            order.assignedDriverId != null &&
                            !reviewedOrderIds.has(order.id)
                    )
                    .map((order) => ({
                        orderId: order.id,
                        orderNo: order.orderNo,
                        description: `${order.departure} → ${order.arrival}`,
                        driverId: order.assignedDriverId,
                        driverName:
                            order.assignedDriverNickname ||
                            `기사 #${order.assignedDriverId}`,

                        completedDate: new Date(
                            order.createdAt
                        ).toLocaleDateString("ko-KR"),
                    }));

                setPendingReviews(unreviewedCompletedOrders);
                setMyReviews(myReviewsData.slice(0, 5));
            } catch (err) {
                console.error("리뷰 데이터를 가져오는 데 실패했습니다.", err);
            }
        };

        loadReviewData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                loadReviewData();
            }
        };

        window.addEventListener("focus", loadReviewData);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", loadReviewData);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const handleWriteReview = (orderId) => {
        navigate(`/shipper/review`, { state: { orderId } });
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        <div className="review-dashboard-card">
            <div className="review-dashboard-header">
                <h3>📝 후기 관리</h3>
                <p>
                    새로 작성할 후기가{" "}
                    <span className="highlight">{pendingReviews.length}</span>건
                    있습니다.
                </p>
            </div>
            <div className="review-dashboard-tabs">
                <button
                    className={`tab-button ${
                        activeTab === "pending" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("pending")}
                >
                    작성할 후기 ({pendingReviews.length})
                </button>
                <button
                    className={`tab-button ${
                        activeTab === "completed" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("completed")}
                >
                    내가 작성한 후기 ({myReviews.length})
                </button>
            </div>
            <div className="review-dashboard-content">
                {activeTab === "pending" ? (
                    <div className="review-list">
                        {pendingReviews.length > 0 ? (
                            pendingReviews.map((review) => (
                                <div
                                    key={review.orderId}
                                    className="review-item pending"
                                >
                                    <div className="review-item-info">
                                        <span>
                                            <strong>
                                                (주문번호 : {review.orderNo}){" "}
                                                {review.description}
                                            </strong>{" "}
                                            ({review.driverName} 기사님)
                                        </span>
                                        <span className="date">
                                            완료: {review.completedDate}
                                        </span>
                                    </div>
                                    <button
                                        className="write-review-btn"
                                        onClick={() =>
                                            handleWriteReview(review.orderId)
                                        }
                                    >
                                        후기 작성하기
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>작성할 후기가 없습니다.</p>
                        )}
                    </div>
                ) : (
                    <div className="review-list">
                        {myReviews.length > 0 ? (
                            myReviews.map((review) => (
                                <div key={review.id} className="review-item">
                                    <div className="review-item-info">
                                        <span>
                                            <strong>
                                                {review.targetNickname}
                                            </strong>
                                            님에게
                                        </span>
                                        <span className="stars">
                                            {renderStars(review.rating)}
                                        </span>
                                    </div>
                                    <p className="review-content">
                                        "{review.content}"
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>내가 작성한 후기가 없습니다.</p>
                        )}
                    </div>
                )}
                <div className="see-more-link">
                    <a href="/shipper/review">...더보기</a>
                </div>
            </div>
        </div>
    );
};

export default ShipperReviewDashboard;
