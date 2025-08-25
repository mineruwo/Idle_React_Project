import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../theme/ShipperCustomCss/ShipperReviewDashBoard.css"; // CSS 파일을 임포트합니다.
import { getMyReviews } from "../../../api/reviewApi"; // 내가 쓴 리뷰 API
// import { getPendingReviews } from '../../../api/orderApi'; // 작성할 리뷰 API (가상)

// 임시 목업 데이터
const mockPendingReviews = [
    {
        orderId: "ORD004",
        description: "부산 → 강릉",
        driverName: "강기사",
        completedDate: "2025.08.22",
    },
    {
        orderId: "ORD005",
        description: "대전 → 서울",
        driverName: "오기사",
        completedDate: "2025.08.21",
    },
    {
        orderId: "ORD006",
        description: "대구 → 인천",
        driverName: "최기사",
        completedDate: "2025.08.20",
    },
];

const ShipperReviewDashboard = () => {
    const [activeTab, setActiveTab] = useState("pending"); // 'pending' 또는 'completed'
    const [pendingReviews, setPendingReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // TODO: API가 준비되면 실제 API 호출로 교체
        // getPendingReviews().then(setPendingReviews);
        setPendingReviews(mockPendingReviews);

        getMyReviews()
            .then((data) => {
                // 최근 5개만 표시
                setMyReviews(data.slice(0, 5));
            })
            .catch((err) => {
                console.error(
                    "내가 작성한 리뷰를 가져오는 데 실패했습니다.",
                    err
                );
            });
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
