import { useEffect, useState } from "react";
import { useLocation, matchPath } from "react-router-dom";
import useCustomMove from "../../../../hooks/useCustomMove";
import "../../../../theme/CarOwner/navbar.css";

const ShipperNavBarComponent = () => {
    const { pathname } = useLocation();
    // 현재 경로 감지
    const [activeMenu, setActiveMenu] = useState("dashboard");

    const {
        carOwnerMoveToDashboard,
        carOwnerMoveToOrders,
        carOwnerMoveToProfile,
        carOwnerMoveToSettlement,
        carOwnerMoveToVehicles,
        carOwnerMoveToOrderBoard,
        carOwnerMoveToInquiries,
    } = useCustomMove();

    const isOrderBoard = !!matchPath({ path: "/car-owner/board/*" }, pathname);
    const isProfile = !!matchPath({ path: "/car-owner/profile/*" }, pathname);
    const isOrders = !!matchPath({ path: "/car-owner/orders/*" }, pathname);
    const isSettlement = !!matchPath({ path: "/car-owner/settlement/*" }, pathname);
    const isVehicles = !!matchPath({ path: "/car-owner/vehicles/*" }, pathname);
    const isDashboard = !!matchPath({ path: "/car-owner/dashboard/*" }, pathname);
    const isInquiries = !!matchPath({ path: "/carPage/inquiries" }, pathname);
    return (
        <div className="bs-component">
            <nav className="navbar navbar-expand-lg bg-primary bg-opacity-75" data-bs-theme="dark">
                <div className="container-fluid">
                    <div className="navbar-brand">차주 페이지</div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#shipperNavbar" aria-controls="shipperNavbar"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="shipperNavbar">
                        <ul className="navbar-nav mx-auto">
                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isDashboard ? "active" : ""}`}
                                onClick={carOwnerMoveToDashboard}>
                                <div className="nav-link">대시보드</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isProfile ? "active" : ""}`}
                                onClick={carOwnerMoveToProfile}>
                                <div className="nav-link">프로필</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isOrderBoard ? "active" : ""}`}
                                onClick={carOwnerMoveToOrderBoard}>
                                <div className="nav-link">오더게시판</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isOrders ? "active" : ""}`}
                                onClick={carOwnerMoveToOrders}>
                                <div className="nav-link">내 운송</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isSettlement ? "active" : ""}`}
                                onClick={carOwnerMoveToSettlement}>
                                <div className="nav-link">정산</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isVehicles ? "active" : ""}`}
                                onClick={carOwnerMoveToVehicles}>
                                <div className="nav-link">내 차량</div>
                            </li>

                            <li className={`nav-item flex-fill py-2 border-bottom border-light border-opacity-25 ${isInquiries ? "active" : ""}`}
                                onClick={carOwnerMoveToInquiries}>
                                <div className="nav-link">문의 내역</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default ShipperNavBarComponent;
