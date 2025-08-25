import { useEffect, useState } from "react";
import useCustomMove from "../../../hooks/useCustomMove";
import "../../../theme/ShipperCustomCss/ShipperDashBoard.css";
import ShippingStatusComponent from "./ShippingStatusComponent";
import { fetchUserPoints } from "../../../api/paymentApi";
import ShipperReviewDashboard from "./ShipperReviewDashboard";

const ShipperDashBoardComponent = (userId) => {
    const { shipperMoveToDetails, shipperMoveToPoint } = useCustomMove();

    const [currentPoints, setCurrentPoints] = useState(0);

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
                    <div className="card-content">11건</div>
                    <div className="card-desc">
                        최근 오더: 진행중 2, 완료 8, 취소 1
                    </div>
                    <div className="card-action" onClick={shipperMoveToDetails}>
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
