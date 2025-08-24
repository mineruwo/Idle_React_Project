import { useAuth } from "../../auth/AuthProvider";
import { useLocation } from "react-router-dom";
import ShipperPaymentComponent from "../../layouts/components/shipperComponent/ShipperPaymentComponent";

const ShipperPaymentPage = () => {
    const { profile, loading, authenticated } = useAuth();
    const location = useLocation();
    const { orderData } = location.state || {};

    if (loading) {
        return <div> 로딩 중...</div>;
    }

    if (!authenticated || !profile) {
        return <div> 로그인이 필요합니다.</div>;
    }

    const { id, idNum, nickname } = profile;

    return (
        <div>
            <ShipperPaymentComponent
                nickname={nickname}
                userId={idNum}
                userEmail={id}
                orderData={orderData}
            />
        </div>
    );
};

export default ShipperPaymentPage;
