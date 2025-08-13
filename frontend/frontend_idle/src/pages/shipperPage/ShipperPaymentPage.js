import { useAuth } from "../../auth/AuthProvider";
import ShipperPaymentComponent from "../../layouts/components/shipperComponent/ShipperPaymentComponent";
useAuth;

const ShipperPaymentPage = () => {
    const { profile, loading, authenticated } = useAuth();

    if (loading) {
        return <div> 로딩 중...</div>;
    }

    if (!authenticated || !profile) {
        return <div> 로그인이 필요합니다.</div>;
    }

    const { id, nickname } = profile;

    return (
        <div>
            <ShipperPaymentComponent nickname={nickname} userId={id} />
        </div>
    );
};

export default ShipperPaymentPage;
