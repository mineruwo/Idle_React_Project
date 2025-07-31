import React, { useState } from "react";
import "../../theme/CarOwner/profile.css"

import { useNavigate } from "react-router-dom";
import useCustomMove from "../../Car_owner/hooks/useCustomMove";



const EditProfilePage = () => {
  const {moveToLisense} = useCustomMove();
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "hong123",
    fullName: "Hong Gil-dong",
    email: "hong@example.com",
    insurance: "000-000-000-00",
    driverLisense: "000-0000-000"
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
          <input name="Username" value={formData.username} onChange={handleChange} />
        </label>
        <label>
          Full Name
          <input name="FullName" value={formData.fullName} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="Email" value={formData.email} onChange={handleChange} />
        </label>
        <label>
          Insurance
          <input name="Insurance" value={formData.insurance} onChange={handleChange} />
          
        </label>
        <label>
          DriverLisense
          <input name="DriverLisense" value={formData.driverLisense} onChange={handleChange} />
          <button className="driverbtn" onClick={moveToLisense}>증서 제출</button>
        </label>
        <button type="button" className="btn" onClick={handleSave}>Save</button>
      </form>
      </div>

    </div>
  );
};
export default EditProfilePage;