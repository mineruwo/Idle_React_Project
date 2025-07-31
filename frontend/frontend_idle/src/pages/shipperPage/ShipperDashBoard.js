import { Outlet } from "react-router-dom";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import ShipperNavBarComponent from "../../layouts/components/shipperComponent/common/ShipperNavBarComponent";

const ShipperDashBoard = () => {
    return (
        <>
            <div className="sticky sticky-top">
                <GNB />
                <ShipperNavBarComponent />
            </div>
            <div>
                <Outlet />

                <Footer />
            </div>
        </>
    );
};

export default ShipperDashBoard;
