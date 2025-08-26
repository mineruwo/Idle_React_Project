import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import "../../../theme/ShipperCustomCss/ShipperReviewDashBoard.css"; // CSS 파일을 임포트합니다.
import { getMyReviews } from "../../../api/reviewApi"; // 내가 쓴 리뷰 API
import { fetchMyOrders } from "../../../api/orderApi"; // Added

const ShipperReviewDashboard = () => {
    const [activeTab, setActiveTab] = useState("pending"); // 'pending' 또는 'completed'
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

                // Process myReviewsData to get a set of reviewed driver IDs
                const reviewedDriverIds = new Set(myReviewsData.map(review => review.targetId));

                // Filter COMPLETED orders that have an assigned driver and haven't been reviewed yet
                const unreviewedCompletedOrders = allOrders
                    .filter(order => 
                        order.status === 'COMPLETED' && 
                        order.assignedDriverId != null &&
                        !reviewedDriverIds.has(order.assignedDriverId) // Check if driver has been reviewed
                    )
                    .map(order => ({
                        orderId: order.id,
                        description: `${order.departure} → ${order.arrival}`,
                        driverId: order.assignedDriverId,
                        driverName: `Driver #${order.assignedDriverId}`,
                        completedDate: new Date(order.createdAt).toLocaleDateString('ko-KR'),
                    }));

                setPendingReviews(unreviewedCompletedOrders);
                setMyReviews(myReviewsData.slice(0, 5)); // Still show only recent 5 for my reviews

            } catch (err) {
                console.error("리뷰 데이터를 가져오는 데 실패했습니다.", err);
                // Optionally set error state for display
            }
        };

        // Initial load
        loadReviewData();

        // Re-fetch data when the window gains focus or tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadReviewData();
            }
        };

        window.addEventListener('focus', loadReviewData);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', loadReviewData);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleWriteReview = (orderId) => {
        // 후기 작성 페이지로 이동하면서 orderId를 전달할 수 있습니다.
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
                                                {review.description}
                                            </strong>{" "}
                                            ({review.driverName}님)
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
