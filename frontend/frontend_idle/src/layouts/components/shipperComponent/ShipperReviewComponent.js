import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../../theme/ShipperCustomCss/ShipperReview.css";
import {
    createReview,
    getReviewsByTarget,
    deleteReview,
    getMyReviews,
} from "../../../api/reviewApi";
import { useAuth } from "../../../auth/AuthProvider";
import { fetchMyOrders } from "../../../api/orderApi";

const ShipperReviewComponent = () => {
    const { profile } = useAuth();
    const currentUserId = profile?.idNum;
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.orderId) {
            setSelectedOrder(location.state.orderId);
        }
    }, [location.state]);

    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [orders, setOrders] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState("");
    const [targetDriverId, setTargetDriverId] = useState(null);
    const [targetDriverName, setTargetDriverName] =
        useState("선택된 차주 없음");

    const ratingRef = useRef();
    const reviewRef = useRef();

    useEffect(() => {
        const order = orders.find((o) => o.orderId === selectedOrder);
        if (order && order.driverId) {
            setTargetDriverId(order.driverId);
            setTargetDriverName(order.driverName);
        } else {
            setTargetDriverId(null);
            setTargetDriverName("선택된 차주 없음");
        }
    }, [selectedOrder, orders]);

    const loadCompletedOrdersForReview = async (currentReviews) => {
        try {
            const allOrders = await fetchMyOrders();
            const reviewedOrderIds = new Set(
                currentReviews.map((review) => review.orderId)
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
                    orderNo: order.orderNo, // Add orderNo
                    description: `${order.departure} -> ${order.arrival}`,
                    driverId: order.assignedDriverId,
                    driverName:
                        order.assignedDriverNickname ||
                        `Driver #${order.assignedDriverId}`,

                    completedDate: new Date(order.createdAt).toLocaleDateString(
                        "ko-KR"
                    ),
                }));
            setOrders(unreviewedCompletedOrders);
        } catch (err) {
            console.error("Failed to fetch reviewable orders:", err);
            setError("리뷰 가능한 오더를 불러오는데 실패했습니다.");
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            const initialReviews = await fetchMyReviews();
            await loadCompletedOrdersForReview(initialReviews);
        };
        initialLoad();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOrder) {
            alert("리뷰를 작성할 오더를 선택해주세요.");
            return;
        }

        const selectedOrderObject = orders.find(
            (o) => o.orderId === Number(selectedOrder)
        );

        if (!selectedOrderObject || selectedOrderObject.driverId == null) {
            alert("배차된 기사가 있는 오더를 선택해주세요.");
            return;
        }

        setTargetDriverId(selectedOrderObject.driverId);
        setTargetDriverName(selectedOrderObject.driverName);

        const reviewContent = reviewRef.current.value;
        const reviewRating = parseInt(ratingRef.current.value);

        if (!reviewContent || reviewContent.trim() === "") {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }
        if (isNaN(reviewRating) || reviewRating < 1 || reviewRating > 5) {
            alert("유효한 평점을 선택해주세요.");
            return;
        }

        try {
            setIsLoading(true);
            const newReviewData = {
                targetId: selectedOrderObject.driverId,
                rating: reviewRating,
                content: reviewContent,
                orderId: selectedOrder,
            };

            await createReview(newReviewData);
            alert("리뷰가 성공적으로 등록되었습니다.");

            const updatedReviews = await fetchMyReviews();

            await loadCompletedOrdersForReview(updatedReviews);

            if (reviewRef.current) {
                reviewRef.current.value = "";
            }
            if (ratingRef.current) {
                ratingRef.current.value = "5";
            }
            setSelectedOrder("");
            setTargetDriverId(null);
            setTargetDriverName("선택된 차주 없음");
        } catch (err) {
            setError("리뷰 등록에 실패했습니다.");
            console.error("Failed to create review:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyReviews = async () => {
        try {
            setIsLoading(true);
            const data = await getMyReviews();
            setReviews(data);
            return data;
        } catch (err) {
            setError("리뷰를 불러오는데 실패했습니다.");
            console.error("Failed to fetch reviews:", err);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            return;
        }
        try {
            setIsLoading(true);
            await deleteReview(reviewId);
            alert("리뷰가 성공적으로 삭제되었습니다.");
            const data = await getMyReviews();
            setReviews(data);
        } catch (err) {
            setError("리뷰 삭제에 실패했습니다.");
            console.error("Failed to delete review:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating) => {
        const fullStars = "★".repeat(rating);
        const emptyStars = "☆".repeat(5 - rating);
        return fullStars + emptyStars;
    };

    if (isLoading) {
        return <div className="review-rating-page">로딩 중...</div>;
    }

    if (error) {
        return (
            <div className="review-rating-page" style={{ color: "red" }}>
                오류: {error}
            </div>
        );
    }

    return (
        <div className="review-rating-page">
            <h2 className="review-page-main-title">이용후기 및 평점</h2>

            <div className="review-container">
                <div className="write-review">
                    <h3>후기 작성</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            리뷰 대상 오더:
                            <select
                                value={selectedOrder}
                                onChange={(e) =>
                                    setSelectedOrder(e.target.value)
                                }
                                required
                            >
                                <option value="">오더를 선택해주세요</option>
                                {orders.map((order) => (
                                    <option
                                        key={order.orderId}
                                        value={order.orderId}
                                    >
                                        (주문번호 : {order.orderNo}){" "}
                                        {order.description} ({order.driverName}{" "}
                                        기사님)
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p>선택된 차주: {targetDriverName}</p>
                        <label>
                            평점 :
                            <select
                                name="rating"
                                ref={ratingRef}
                                defaultValue="5"
                            >
                                <option value="5">★★★★★ (5)</option>
                                <option value="4">★★★★☆ (4)</option>
                                <option value="3">★★★☆☆ (3)</option>
                                <option value="2">★★☆☆☆ (2)</option>
                                <option value="1">★☆☆☆☆ (1)</option>
                            </select>
                        </label>
                        <textarea
                            name="review"
                            placeholder="후기를 남겨주세요"
                            ref={reviewRef}
                            required
                        ></textarea>
                        <button type="submit" disabled={isLoading}>
                            등록
                        </button>
                    </form>
                </div>

                <div className="review-list">
                    <h3>리뷰 목록</h3>
                    {reviews.length === 0 ? (
                        <p>아직 작성된 리뷰가 없습니다.</p>
                    ) : (
                        reviews.map((review) => (
                            <div className="review-item" key={review.id}>
                                {" "}
                                <div className="review-header">
                                    <span className="reviewer-name">
                                        {review.authorNickname}
                                    </span>
                                    <span className="driver-name">
                                        ({review.targetNickname} 대상)
                                    </span>
                                    <span className="stars">
                                        {renderStars(review.rating)}
                                    </span>
                                    <span className="date">
                                        {new Date(
                                            review.createdAt
                                        ).toLocaleDateString()}
                                    </span>{" "}
                                    {profile &&
                                        review.authorNickname ===
                                            profile.nickname && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(review.id)
                                                }
                                                className="delete-btn"
                                            >
                                                삭제
                                            </button>
                                        )}
                                </div>
                                <div className="review-content">
                                    {review.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipperReviewComponent;
