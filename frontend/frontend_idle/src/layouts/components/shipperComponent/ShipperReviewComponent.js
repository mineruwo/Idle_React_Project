import React, { useState, useRef, useEffect } from 'react';
import "../../../theme/ShipperCustomCss/ShipperReview.css";
import { createReview, getReviewsByTarget, deleteReview } from '../../../api/reviewApi'; // API 함수 임포트
import { useAuth } from '../../../auth/AuthProvider'; // 사용자 정보 가져오기

const ShipperReviewComponent = () => {
    const { profile } = useAuth(); // 현재 로그인된 사용자 정보
    const currentUserId = profile?.idNum; // 현재 사용자의 idNum (화주 ID)

    const [reviews, setReviews] = useState([]); // 초기 리뷰 목록을 빈 배열로 설정
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // Mock order data - In a real application, this would come from an API
    // 실제로는 화주가 완료한 오더 목록을 백엔드에서 가져와야 합니다.
    const [orders, setOrders] = useState([
        { orderId: 'ORD001', description: '서울-부산 운송', driverId: 37, driverName: '김차주' }, // driverId는 CustomerEntity의 idNum이라고 가정
        { orderId: 'ORD002', description: '인천-대구 운송', driverId: 25, driverName: '이차주' },
        { orderId: 'ORD003', description: '광주-대전 운송', driverId: null , driverName: '배차 전' },
    ]);

    const [selectedOrder, setSelectedOrder] = useState(''); // Stores the selected orderId
    const [targetDriverId, setTargetDriverId] = useState(null); // 리뷰 대상 차주의 idNum
    const [targetDriverName, setTargetDriverName] = useState('선택된 차주 없음');

    const ratingRef = useRef();
    const reviewRef = useRef();

    // 선택된 오더에 따라 차주 정보 업데이트
    useEffect(() => {
        const order = orders.find(o => o.orderId === selectedOrder);
        if (order && order.driverId) {
            setTargetDriverId(order.driverId);
            setTargetDriverName(order.driverName);
        } else {
            setTargetDriverId(null);
            setTargetDriverName('선택된 차주 없음');
        }
    }, [selectedOrder, orders]);

    // 컴포넌트 마운트 시 리뷰 목록 불러오기
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoading(true);
                // 특정 차주(targetId)의 리뷰를 가져오려면 해당 차주의 ID가 필요합니다.
                // 여기서는 예시로 첫 번째 오더의 driverId를 사용하거나,
                // 모든 리뷰를 가져오는 API가 있다면 해당 API를 호출해야 합니다.
                // 현재 백엔드 API는 targetId를 필수로 받으므로, 임시로 첫 번째 드라이버의 ID를 사용합니다.
                // 실제로는 리뷰를 보고자 하는 차주의 ID를 동적으로 받아와야 합니다.
                const defaultTargetId = orders.length > 0 && orders[0].driverId ? orders[0].driverId : null;
                if (defaultTargetId) {
                    const data = await getReviewsByTarget(defaultTargetId);
                    setReviews(data);
                } else {
                    setReviews([]); // 대상이 없으면 빈 배열
                }
            } catch (err) {
                setError('리뷰를 불러오는데 실패했습니다.');
                console.error('Failed to fetch reviews:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [orders]); // orders 상태가 변경될 때 다시 불러오도록 의존성 추가

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOrder || !targetDriverId || targetDriverName === '배차 전' || targetDriverName === '선택된 차주 없음') {
            alert('리뷰를 작성할 오더를 선택하거나, 배차된 기사가 있는 오더를 선택해주세요.');
            return;
        }

        const reviewContent = reviewRef.current.value;
        const reviewRating = parseInt(ratingRef.current.value);

        if (!reviewContent || reviewContent.trim() === '') {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }
        if (isNaN(reviewRating) || reviewRating < 1 || reviewRating > 5) {
            alert('유효한 평점을 선택해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            const newReviewData = {
                targetId: targetDriverId, // CustomerEntity의 idNum
                rating: reviewRating,
                content: reviewContent,
                // orderId: selectedOrder, // 백엔드 ReviewRequestDto에 orderId 필드가 없으므로 주석 처리
            };
            
            await createReview(newReviewData);
            alert('리뷰가 성공적으로 등록되었습니다.');

            // 리뷰 등록 후 목록 갱신 (여기서는 임시로 첫 번째 드라이버의 리뷰를 다시 불러옴)
            // 실제로는 해당 오더의 리뷰만 갱신하거나, 모든 리뷰를 다시 불러와야 합니다.
            const data = await getReviewsByTarget(targetDriverId);
            setReviews(data);

            // 폼 초기화
            if (reviewRef.current) {
                reviewRef.current.value = '';
            }
            if (ratingRef.current) {
                ratingRef.current.value = '5';
            }
            setSelectedOrder('');
            setTargetDriverId(null);
            setTargetDriverName('선택된 차주 없음');

        } catch (err) {
            setError('리뷰 등록에 실패했습니다.');
            console.error('Failed to create review:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }
        try {
            setIsLoading(true);
            await deleteReview(reviewId);
            alert('리뷰가 성공적으로 삭제되었습니다.');
            // 삭제 후 목록 갱신 (여기서는 임시로 첫 번째 드라이버의 리뷰를 다시 불러옴)
            const defaultTargetId = orders.length > 0 && orders[0].driverId ? orders[0].driverId : null;
            if (defaultTargetId) {
                const data = await getReviewsByTarget(defaultTargetId);
                setReviews(data);
            }
        } catch (err) {
            setError('리뷰 삭제에 실패했습니다.');
            console.error('Failed to delete review:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating) => {
        const fullStars = '★'.repeat(rating);
        const emptyStars = '☆'.repeat(5 - rating);
        return fullStars + emptyStars;
    };

    if (isLoading) {
        return <div className="review-rating-page">로딩 중...</div>;
    }

    if (error) {
        return <div className="review-rating-page" style={{ color: 'red' }}>오류: {error}</div>;
    }

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
                            <select name="rating" ref={ratingRef} defaultValue="5">
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
                        <button type="submit" disabled={isLoading}>등록</button>
                    </form>
                </div>

                <div className="review-list">
                    <h3>리뷰 목록</h3>
                    {reviews.length === 0 ? (
                        <p>아직 작성된 리뷰가 없습니다.</p>
                    ) : (
                        reviews.map((review) => (
                            <div className="review-item" key={review.id}> {/* key를 review.id로 변경 */}
                                <div className="review-header">
                                    <span className="reviewer-name">{review.authorNickname}</span>
                                    <span className="driver-name">({review.targetNickname} 대상)</span>
                                    <span className="stars">{renderStars(review.rating)}</span>
                                    <span className="date">{new Date(review.createdAt).toLocaleDateString()}</span> {/* 날짜 형식 변경 */}
                                    {/* 현재 로그인된 사용자가 작성한 리뷰만 삭제 버튼 표시 */}
                                    {profile && review.authorNickname === profile.nickname && (
                                        <button onClick={() => handleDelete(review.id)} className="delete-btn">삭제</button>
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