import { useEffect, useState } from "react";
import "../../../../../src/theme/CarOwner/profile.css"
import useCustomMove from "../../../../hooks/useCustomMove";
import { fetchCarOwnerProfileMe } from "../../../../api/CarOwnerProfileApi";

const ProfileComponent = () => {
  const { carOwnerMoveToEditProfile } = useCustomMove();
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchCarOwnerProfileMe()
      .then(setUser)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="profilewrapper">에러: {err}</div>;
  if (!user) return <div className="profilewrapper">로딩 중...</div>;

  return (
    <div className="profilewrapper">
      <div className="infodiv">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="imgdiv">
              <img src={user.avatarUrl || "/img/main/tungtung.PNG"} alt="avatar" />
            </div>
          </div>
          <div className="avatar-info">
            <h3>{user.customName}</h3>
            <p>{user.nickname}</p>
          </div>
        </div>
        <div className="profile-main">
          <div className="profile-info">
            <p><strong>Nickname:</strong> {user.nickname}</p>
            <p><strong>Name:</strong> {user.customName}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
          </div>
          <div className="navbutton">
            <button className="btn" onClick={carOwnerMoveToEditProfile}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;