import React from "react";
import "../../../../theme/CarOwner/cardashboard.css";
import useCustomMove from "../../../../hooks/useCustomMove";
import WarmthPieChart from "./WarmPieChart";

const DashboardHeader = ({ name, completed, inProgress, scheduled, total, revenue, commission, settlement }) => {
  const { moveToSettlement } = useCustomMove();

  return (
    <div className="dashboard-row"> {/* ✅ 바깥 wrapper로 감싸기 */}
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
        <button onClick={moveToSettlement}>정산하기</button>
      </div>

      {/* ✅ box 바깥으로 이동! */}
      <div className="warmth-alert">
        <div className="warmthgraph">

        </div>
        <WarmthPieChart onTime={18} late={2}/>
        <div className="warminfo">
        <p><strong>{name}님</strong>, 따뜻함 온도 💗 <strong>100</strong></p>
        <p>🕒 와우! 완벽 합니다!</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;