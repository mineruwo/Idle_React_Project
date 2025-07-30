import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import ShipperNavBarComponent from "../../layouts/components/shipperComponent/common/ShipperNavBarComponent";
import ShipperDashBoardComponent from "../../layouts/components/shipperComponent/ShipperDashBoardComponent";

const ShipperDashBoard = () => {
    return (
        <div className="sticky sticky-top">
            <GNB />
            <ShipperNavBarComponent />

            <div>
                <ShipperDashBoardComponent />
            </div>
            <Footer />
        </div>


    );
}

export default ShipperDashBoard;
