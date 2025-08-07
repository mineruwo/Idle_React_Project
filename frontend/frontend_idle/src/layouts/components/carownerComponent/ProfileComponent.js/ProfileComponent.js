import { useEffect, useState } from "react";
import "../../../../theme/CarOwner/profile.css";
import useCustomMove from "../../../../hooks/useCustomMove";
import { fetchCarOwnerProfile } from "../../../../api/CarOwnertransportApi";

const ProfileComponent = () => {
  const { carOwnerMoveToEditProfile } = useCustomMove();
  const [user, setUser] = useState(null);
  const customName = "hongcha"; // 나중에 로그인 유저 정보로 교체

  useEffect(() => {
    fetchCarOwnerProfile(customName)
      .then(setUser)
      .catch((err) => console.error("프로필 불러오기 실패", err));
  }, [customName]);

  if (!user) return <div className="profilewrapper">로딩 중...</div>;

  return (
    <div className="profilewrapper">
      <div className="infodiv">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="imgdiv">
              <img src="/img/main/tungtung.PNG" />
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