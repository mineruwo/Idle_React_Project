import { useNavigate } from "react-router-dom";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import GNB from "../../layouts/components/common/GNB";

const Order = () => {
    const navigate = useNavigate();
    const user = {
        username: "hong123",
        fullName: "Hong Gil-dong",
        email: "hong@example.com"
    };
    return (
        <div>
            <div className="topmenu sticky-top">
                <GNB />
                <NaviTap />
            </div>
            <div className="profile-card">
                <h2>Profile</h2>
                <div className="profile-avatar"></div>
                <h3>{user.fullName}</h3>
                <p>{user.email}</p>
                <div className="profile-info">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Full Name:</strong> {user.fullName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                <button className="btn" onClick={() => navigate("/profile/edit")}>Edit Profile</button>
            </div>
            <Footer />
        </div>
    );
}
export default Order