import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = {
    username: "hong123",
    fullName: "Hong Gil-dong",
    email: "hong@example.com"
  };

  return (
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
  );
};

export default ProfilePage;