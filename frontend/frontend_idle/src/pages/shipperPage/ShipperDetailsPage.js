import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import ShipperNavBarComponent from "../../layouts/components/shipperComponent/common/ShipperNavBarComponent";

const ShipperDetailsPage = () => {
    return (
        <div className="sticky sticky-top">
            <GNB />
            <ShipperNavBarComponent />

            <div>Body</div>
            <Footer />
        </div>
    );
};

export default ShipperDetailsPage;
