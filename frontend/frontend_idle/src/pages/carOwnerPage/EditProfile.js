import React, { useState } from "react";
import "../../theme/CarOwner/profile.css"
import GNB from "../../layouts/components/common/GNB";
import NaviTap from "../../layouts/components/carownerComponent/common/NaviTap";
import Footer from "../../layouts/components/common/Footer";
import { useNavigate } from "react-router-dom";




const EditProfilePage = () => {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "hong123",
    fullName: "Hong Gil-dong",
    email: "hong@example.com"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving", formData);
    navigate("../profile")
    
  };

  return (
    <div className="profile-card">
      
      <div className="profile-avatar"></div>
      <div className="profileEdit">
      <form className="edit-form">
        <label>
          Username
          <input name="username" value={formData.username} onChange={handleChange} />
        </label>
        <label>
          Full Name
          <input name="fullName" value={formData.fullName} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" value={formData.email} onChange={handleChange} />
        </label>
        <button type="button" className="btn" onClick={handleSave}>Save</button>
      </form>
      </div>

    </div>
  );
};
export default EditProfilePage;