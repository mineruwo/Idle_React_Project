import React from "react";
import ShipperPaymentComponent from "../../layouts/components/shipperComponent/ShipperPaymentComponent";

const ShipperPaymentPage = () => {
  const nickname = "testUser"; // 예시 닉네임
  const userId = 1; // 임시 userId 설정. 실제 애플리케이션에서는 인증된 사용자 정보에서 가져와야 합니다.

  return (
    <div>
      <ShipperPaymentComponent nickname={nickname} userId={userId} />
    </div>
  );
};

export default ShipperPaymentPage;
