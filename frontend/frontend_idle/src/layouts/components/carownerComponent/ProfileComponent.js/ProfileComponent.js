
import "../../../../theme/CarOwner/profile.css";
import useCustomMove from "../../../../Car_owner/hooks/useCustomMove"

const ProfileComponent = () => {
    const { moveToEditProfile } = useCustomMove();
    const user = {
        username: "hong123",
        fullName: "Hong Gil-dong",
        email: "hong@example.com",
        driverLisenseNum: "000-0000-000",
        insurance: "0000-000-00000-00"
    };
    return (
        <div className="infodiv">
            <div className="profile-card " >
                
                <div className="profile-avatar">
                    <div className="imgdiv">
                    <img src="../../../public/img/tungtung.PNG"/>
                    </div>
                </div>
                <div className="avatar-info">
                    <h3>{user.fullName}</h3>
                    <p>{user.email}</p>
                    </div>
            </div>
            <div className="profile-main">
                    
                    <div className="profile-info">
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>Full Name:</strong> {user.fullName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>DriverLisense:</strong> {user.driverLisenseNum}</p>
                        <p><strong>Insurance:</strong> {user.insurance}</p>
                    </div>
                    <div className="navbutton">
                    <button className="btn" onClick={moveToEditProfile}>Edit Profile</button>
                    </div>
                </div>
            </div>
    );
}
export default ProfileComponent;