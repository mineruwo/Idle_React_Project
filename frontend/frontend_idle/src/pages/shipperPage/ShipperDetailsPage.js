import ShipperDetailsComponent from "../../layouts/components/shipperComponent/ShipperDetailsComponent";
import "../../theme/ShipperCustomCss/ShipperDetails.css";

const ShipperDetailsPage = () => {
    return (
        <div className="delivery-detail-container">
            <h2 className="page-title">배송 상세 정보</h2>
            <ShipperDetailsComponent />
            <ShipperDetailsComponent />
            <ShipperDetailsComponent />
        </div>
    );
};

export default ShipperDetailsPage;
