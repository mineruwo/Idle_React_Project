import { useAuth } from "../../auth/AuthProvider";
import ShipperPointComponent from "../../layouts/components/shipperComponent/ShipperPointComponent";

const ShipperPointPage = () => {
    const { profile, loading, authenticated } = useAuth();

    if (loading) {
        return <div> 로딩 중...</div>;
    }

    if (!authenticated || !profile) {
        return <div> 로그인이 필요합니다.</div>;
    }

    const { id, idNum, nickname } = profile;

    return (
        <div>
            <ShipperPointComponent
                nickname={nickname}
                userId={idNum}
                userEmail={id}
            />
        </div>
    );
};

export default ShipperPointPage;
