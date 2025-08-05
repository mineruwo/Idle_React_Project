import React, { useState } from "react";
import ShipperPaymentComponent from "../../layouts/components/shipperComponent/ShipperPaymentComponent";

const ShipperPaymentPage = () => {
    // 포인트 상태를 관리합니다.
    const [currentPoints, setCurrentPoints] = useState(50000); // 초기 포인트 설정
    const nickname = "testUser"; // 예시 닉네임
    const userId = 1; // 임시 userId 설정. 실제 애플리케이션에서는 인증된 사용자 정보에서 가져와야 합니다.

    // 포인트 충전 성공 시 호출될 콜백 함수
    const handleChargeSuccess = (chargeAmount) => {
        setCurrentPoints((prevPoints) => prevPoints + chargeAmount);
    };

    // 포인트 결제 성공 시 호출될 콜백 함수
    const handlePaymentSuccess = (pointsToUse) => {
        setCurrentPoints((prevPoints) => prevPoints - pointsToUse);
    };

    return (
        <div>
            <ShipperPaymentComponent
                currentPoints={currentPoints}
                nickname={nickname}
                onChargeSuccess={handleChargeSuccess}
                onPaymentSuccess={handlePaymentSuccess}
                userId={userId} // userId prop 전달
            />
        </div>
    );
};

export default ShipperPaymentPage;
