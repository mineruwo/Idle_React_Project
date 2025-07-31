import React, { useState } from "react";
import "../../../../theme/CarOwner/fileForm.css";

const Verification = () => {
  const [driverLicense, setDriverLicense] = useState(null);
  const [businessCert, setBusinessCert] = useState(null);

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!driverLicense || !businessCert) {
      alert("모든 파일을 업로드해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("driverLicense", driverLicense);
    formData.append("businessCert", businessCert);

    try {
      const response = await fetch("/api/verify-documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("서버 오류 발생");

      const result = await response.json();
      alert("검증 성공: " + JSON.stringify(result));
    } catch (err) {
      alert("검증 실패: " + err.message);
    }
  };

  return (
    <div className="file-form">
      <h2>파일 검증</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>운전면허증</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, setDriverLicense)}
          />
        </div>

        <div className="form-group">
          <label>사업자등록증</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, setBusinessCert)}
          />
        </div>

        <button className="btn" type="submit">검증 요청</button>
      </form>
    </div>
  );
};

export default Verification;