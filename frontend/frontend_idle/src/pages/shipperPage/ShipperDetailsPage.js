import ShipperDetailsComponent from "../../layouts/components/shipperComponent/ShipperDetailsComponent";

const ShipperDetailsPage = () => {
    return (
        <div>
            <h2>배송 상세 정보</h2>
            <div>
                <ShipperDetailsComponent />
                <ShipperDetailsComponent />
                <ShipperDetailsComponent />
            </div>
        </div>
    );
};

export default ShipperDetailsPage;
