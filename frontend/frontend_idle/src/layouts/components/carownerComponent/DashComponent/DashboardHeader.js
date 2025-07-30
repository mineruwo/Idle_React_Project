import React from "react";
import "../DashComponent/styles/dashboard.css";

const DashboardHeader = ({ name, completed, inProgress, scheduled, total, revenue, commission, settlement }) => {
  return (
    <div className="header-box">
      <h2>👤 {name}님 운송 현황</h2>
      <ul>
        <li>✅ 완료: {completed}건</li>
        <li>🚚 진행중: {inProgress}건</li>
        <li>📅 예정: {scheduled}건</li>
        <li>📦 총 운송건수: {total}건</li>
      </ul>
      <hr />
      <h3>💰 이번달 매출 요약</h3>
      <p>총 매출액: {revenue.toLocaleString()}원</p>
      <p>수수료율: {commission}%</p>
      <p>정산예정금액: {settlement.toLocaleString()}원</p>
      <button>정산하기</button>
    </div>
  );
};

export default DashboardHeader;