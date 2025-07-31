
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import "../../theme/CarOwner/profile.css";
import useCustomMove from "../../Car_owner/hooks/useCustomMove";
import ProfileComponent from "../../layouts/components/carownerComponent/ProfileComponent.js/ProfileComponent";


const Profile = () => {
    return (
        <div>
            <div className="topmenu sticky-top">
                <GNB />
                <NaviTap />

            </div>
            <div>
                <ProfileComponent/>
            </div>
            <Footer />
        </div>
    );
}
export default Profile