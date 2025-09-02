
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import "../../theme/CarOwner/profile.css";
import ProfileComponent from "../../layouts/components/carownerComponent/ProfileComponent.js/ProfileComponent";
import EditProfilePage from "../../layouts/components/carownerComponent/ProfileComponent.js/EditProfileComponent";


const editProfile = () => {
    return (
        <div>
            <div className="topmenu">
                <GNB />
                <NaviTap />

            </div>
            <div>
                <EditProfilePage/>
            </div>
            <Footer />
        </div>
    );
}
export default editProfile;