import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";

const Profile = ()  => {
    return(
        <div>
            <div className="topmenu sticky-top">
            <GNB />
            <NaviTap />
            </div>
             <div>
            프로필
            </div> 
            
            <Footer />
        </div>
    );
}
export default Profile