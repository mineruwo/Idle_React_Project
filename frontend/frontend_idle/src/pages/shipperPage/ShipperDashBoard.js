import { Outlet } from "react-router-dom";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import ShipperNavBarComponent from "../../layouts/components/shipperComponent/common/ShipperNavBarComponent";

const ShipperDashBoard = () => {
    return (
        <div>
            <div>
                <GNB />
                <ShipperNavBarComponent />
            </div>
            <div style={{ paddingTop: "30px" }}>
                <Outlet />

                <Footer />
            </div>
        </div>
    );
};

export default ShipperDashBoard;
