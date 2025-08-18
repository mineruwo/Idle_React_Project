import React, { useState, useRef, useEffect } from 'react';
import "../../../theme/ShipperCustomCss/ShipperReview.css";

const ShipperReviewComponent = () => {
    const [reviews, setReviews] = useState([
        {
            reviewer: '화주A',
            driverName: '김차주',
            rating: 5,
            date: '2025-07-20',
            content: '빠르고 친절한 운송 감사합니다!',
        },
        {
            reviewer: '화주B',
            driverName: '이차주',
            rating: 4,
            date: '2025-07-10',
            content: '전반적으로 만족하지만 출발 시간이 조금 늦었어요.',
        },
    ]);

    // Mock order data - In a real application, this would come from an API
    const [orders, setOrders] = useState([
        { orderId: 'ORD001', description: '서울-부산 운송', driverId: 'DRV001', driverName: '김차주' },
        { orderId: 'ORD002', description: '인천-대구 운송', driverId: 'DRV002', driverName: '이차주' },
        { orderId: 'ORD003', description: '광주-대전 운송', driverId: '' , driverName: '배차 전' }, // Example of an order without an assigned driver yet
    ]);

    const [selectedOrder, setSelectedOrder] = useState(''); // Stores the selected orderId
    const [targetDriverName, setTargetDriverName] = useState('선택된 차주 없음');

    const ratingRef = useRef();
    const reviewRef = useRef();

    // Update targetDriverName when selectedOrder changes
    useEffect(() => {
        const order = orders.find(o => o.orderId === selectedOrder);
        if (order) {
            setTargetDriverName(order.driverName);
        } else {
            setTargetDriverName('선택된 차주 없음');
        }
    }, [selectedOrder, orders]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedOrder || targetDriverName === '배차 전' || targetDriverName === '선택된 차주 없음') {
            alert('리뷰를 작성할 오더를 선택하거나, 배차된 기사가 있는 오더를 선택해주세요.');
            return;
        }

        const newReview = {
            reviewer: '새로운 화주', // This would typically be the logged-in user's name
            driverName: targetDriverName,
            rating: parseInt(ratingRef.current.value),
            date: new Date().toISOString().slice(0, 10),
            content: reviewRef.current.value,
        };

        setReviews([newReview, ...reviews]); // Add new review to the top of the list

        // Clear form fields and reset selection
        ratingRef.current.value = '5';
        reviewRef.current.value = '';
        setSelectedOrder('');
    };

    const renderStars = (rating) => {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    };

    return (
        <div className="review-rating-page">
            <h2 className="page-title">이용후기 및 평점</h2>

            <div className="review-container">
                <div className="write-review">
                    <h3>후기 작성</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            리뷰 대상 오더:
                            <select
                                value={selectedOrder}
                                onChange={(e) => setSelectedOrder(e.target.value)}
                                required
                            >
                                <option value="">오더를 선택해주세요</option>
                                {orders.map((order) => (
                                    <option key={order.orderId} value={order.orderId}>
                                        {order.description} (기사: {order.driverName})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <p>선택된 차주: {targetDriverName}</p>
                        <label>
                            평점 :
                            <select name="rating" ref={ratingRef}>
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
                        <button type="submit">등록</button>
                    </form>
                </div>

                <div className="review-list">
                    <h3>리뷰 목록</h3>
                    {reviews.map((review, index) => (
                        <div className="review-item" key={index}>
                            <div className="review-header">
                                <span className="reviewer-name">{review.reviewer}</span>
                                <span className="driver-name">({review.driverName} 대상)</span>
                                <span className="stars">{renderStars(review.rating)}</span>
                                <span className="date">{review.date}</span>
                            </div>
                            <div className="review-content">
                                {review.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShipperReviewComponent;
