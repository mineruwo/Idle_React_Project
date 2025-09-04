import React from "react";
import GNB from "../../layouts/components/common/GNB";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import CarOwnerDashboard from "../../layouts/components/carownerComponent/DashComponent/CarOwnerDashboardComponent";

const CarDashpage = () => {
  return (
    <div>
      {/* 상단 고정 메뉴: 기존 className 유지 */}
      <div className="topmenu">
        <GNB />
        <NaviTap />
      </div>

      {/* 본문: 우리가 만든 대시보드(내부에서 dashboard-container 등 className 사용) */}
      <CarOwnerDashboard />

      {/* 하단 푸터: 위치 그대로 */}
      <Footer />
    </div>
  );
};

export default CarDashpage;