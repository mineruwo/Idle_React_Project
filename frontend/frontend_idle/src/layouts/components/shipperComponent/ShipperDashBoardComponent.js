import useCustomMove from "../../../hooks/useCustomMove";
import "../../../theme/ShipperCustomCss/ShipperDashBoard.css";
import ShippingStatusComponent from "./ShippingStatusComponent";

const ShipperDashBoardComponent = () => {
    const {
        shipperMoveToDetails,
        shipperMoveToPayment,
        shipperMoveToReview,
        shipperMoveToExample,
    } = useCustomMove();

    return (
        <div className="dashboard">
            <div className="card">
                <div className="card-title">오더상세</div>
                <div className="card-content">11건</div>
                <div className="card-desc">
                    최근 오더: 진행중 2, 완료 8, 취소 1
                </div>
                <div className="card-action" onClick={shipperMoveToDetails}>
                    상세보기
                </div>
            </div>
            <div className="card">
                <div className="card-title">배송현황</div>
                <ShippingStatusComponent />
            </div>
            <div className="card">
                <div className="card-title">포인트</div>
                <div className="card-content">175,000P</div>
                <div className="card-desc">최근 충전: +20,000P</div>
                <div className="card-action" onClick={shipperMoveToPayment}>
                    포인트 내역
                </div>
            </div>
            <div className="card">
                <div className="card-title">후기</div>
                <div className="card-content">평점 4.8 ★</div>
                <div className="card-desc">최근 후기 3개, 후기 작성 가능</div>
                <div className="card-action" onClick={shipperMoveToReview}>
                    내 후기 보기
                </div>
            </div>
            <div onClick={shipperMoveToExample}>예시</div>
        </div>
    );
};

export default ShipperDashBoardComponent;
