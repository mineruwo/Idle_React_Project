import "../../../theme/ShipperCustomCss/ShipperReview.css";

const ShipperReviewComponent = () => {
    return (
        <div class="review-rating-page">
            <h2 className="page-title">이용후기 및 평점</h2>

            <div class="review-container">
                <div class="write-review">
                    <h3>후기 작성</h3>
                    <form>
                        <label>
                            평점 :
                            <select name="rating">
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
                            required
                        ></textarea>
                        <button type="submit">등록</button>
                    </form>
                </div>

                <div class="review-list">
                    <h3>리뷰 목록</h3>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">화주A</span>
                            <span class="stars">★★★★★</span>
                            <span class="date">2025-07-20</span>
                        </div>
                        <div class="review-content">
                            빠르고 친절한 운송 감사합니다!
                        </div>
                    </div>
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">화주B</span>
                            <span class="stars">★★★★☆</span>
                            <span class="date">2025-07-10</span>
                        </div>
                        <div class="review-content">
                            전반적으로 만족하지만 출발 시간이 조금 늦었어요.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipperReviewComponent;
