import { Outlet } from "react-router-dom";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import ShipperNavBarComponent from "../../layouts/components/shipperComponent/common/ShipperNavBarComponent";
import { useAuth } from "../../auth/AuthProvider";

const ShipperDashBoard = () => {
    const { profile, loading, authenticated } = useAuth();

    if (loading) {
        return <div> 로딩 중...</div>;
    }

    if (!authenticated || !profile) {
        return <div> 로그인이 필요합니다.</div>;
    }

    const { idNum } = profile;

    return (
        <div>
            <div>
                <GNB />
                <ShipperNavBarComponent userId={idNum} />
            </div>
            <div style={{ padding: "0 200px 0 200px" }}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default ShipperDashBoard;
