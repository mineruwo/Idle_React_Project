import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useCustomMove from "../../../../Car_owner/hooks/UseCustomMove";
import "../../../../theme/CarOwner/navbar.css";

const ShipperNavBarComponent = () => {
  const location = useLocation(); // 현재 경로 감지
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const {
    moveToDashboard,
    moveToOrders,
    moveToProfile,
    moveToSettlement,
    moveToVehucles,
  } = useCustomMove();

  useEffect(() => {
    // URL path 기준으로 active 상태 설정
    if (location.pathname.includes("dashboard")) setActiveMenu("dashboard");
    else if (location.pathname.includes("profile")) setActiveMenu("profile");
    else if (location.pathname.includes("orders")) setActiveMenu("orders");
    else if (location.pathname.includes("settlement")) setActiveMenu("settlement");
    else if (location.pathname.includes("vehucles")) setActiveMenu("vehucles");
  }, [location.pathname]);

  return (
    <div className="bs-component">
      <nav className="navbar navbar-expand-lg bg-primary bg-opacity-75" data-bs-theme="dark">
        <div className="container-fluid">
          <div className="navbar-brand">차주 페이지</div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#shipperNavbar"
            aria-controls="shipperNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="shipperNavbar">
            <ul className="navbar-nav mx-auto">

              <li className={`nav-item py-2 border-bottom border-light border-opacity-25 ${activeMenu === "dashboard" ? "active" : ""}`} onClick={moveToDashboard}>
                <div className="nav-link">대시보드</div>
              </li>

              <li className={`nav-item py-2 border-bottom border-light border-opacity-25 ${activeMenu === "profile" ? "active" : ""}`} onClick={moveToProfile}>
                <div className="nav-link">프로필</div>
              </li>

              <li className={`nav-item py-2 border-bottom border-light border-opacity-25 ${activeMenu === "orders" ? "active" : ""}`} onClick={moveToOrders}>
                <div className="nav-link">내 운송</div>
              </li>

              <li className={`nav-item py-2 border-bottom border-light border-opacity-25 ${activeMenu === "settlement" ? "active" : ""}`} onClick={moveToSettlement}>
                <div className="nav-link">정산</div>
              </li>

              <li className={`nav-item py-2 border-bottom border-light border-opacity-25 ${activeMenu === "vehucles" ? "active" : ""}`} onClick={moveToVehucles}>
                <div className="nav-link">내 차량</div>
              </li>

            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ShipperNavBarComponent;