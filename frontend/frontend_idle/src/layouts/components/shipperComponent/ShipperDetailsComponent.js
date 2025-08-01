import "react-datepicker/dist/react-datepicker.css";
import "../../../theme/ShipperCustomCss/ShipperDetails.css";

const ShipperDetailsComponent = ({ delivery }) => {
    return (
        <div className="delivery-detail-container">
            <h2 className="page-title">오더 상세 정보</h2>
            <div className="card">
                <div className="status-display">
                    <span
                        className={
                            delivery && delivery.assignmentStatus === "완료"
                                ? "status-complete"
                                : "status-waiting"
                        }
                    >
                        운송중
                        {delivery && delivery.assignmentStatus}
                    </span>
                </div>

                <div className="delivery-section">
                    <span className="request-number">ABC1234567</span>
                    <span className="delivery-label">
                        등록일 : 2025-07-31 목요일 오후 3시 31분
                        {delivery && delivery.registeredDate}
                    </span>
                </div>
                <div className="delivery-section">
                    <span className="delivery-label">
                        상차(출발) | 25/07/31 오후 03:00{" "}
                        {delivery && delivery.loadTime} / 서울특별시{" "}
                        {delivery && delivery.loadPlace}
                    </span>
                </div>
                <div className="delivery-section">
                    <span className="delivery-label">
                        하차(도착) | 25/07/31 오후 08:00{" "}
                        {delivery && delivery.loadTime} / 경기도{" "}
                        {delivery && delivery.loadPlace}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ShipperDetailsComponent;
