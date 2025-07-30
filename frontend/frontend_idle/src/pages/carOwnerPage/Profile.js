import { useNavigate } from "react-router-dom";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";
import "../../theme/CarOwner/profile.css";



const Profile = () => {
    const{moveToEditProfile} = useCustomMove();
    const user = {
        username: "hong123",
        fullName: "Hong Gil-dong",
        email: "hong@example.com",
        driverLisenseNum: "000-0000-000"

    };
    return (
        <div>
            <div className="topmenu sticky-top">
                <GNB />
                <NaviTap />

            </div>
            <div className="infodiv">
            <div className="profile-card " >
                
                <div className="profile-avatar">
                    <div className="imgdiv">
                    <img src="../../../public/img/tungtung.PNG"/>
                    </div>
                    <div>
                    <h3>{user.fullName}</h3>
                    <p>{user.email}</p>
                    </div>
                </div>
            </div>
            <div className="profile-main">
                    
                    <div className="profile-info">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Full Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>DriverLisense:</strong> {user.driverLisenseNum}</p>
                    </div>
                    <div className="navbutton">
                    <button className="btn" onClick={() => {moveToEditProfile}}>Edit Profile</button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
export default Profile