import React from "react";
import "../../../../theme/CarOwner/cardashboard.css";
import useCustomMove from "../../../../hooks/useCustomMove";
import WarmthPieChart from "./WarmPieChart";
import { useEffect } from "react";
import { fetchTransportSummary } from "../../../../api/CarOwnertransportApi";
import { useState } from "react";

const DashboardHeader = ({ name, completed, inProgress, scheduled, total, revenue, commission, settlement }) => {
  const [summary, setSummary] = useState(null);
  const { carOwnerMoveToSettlement } = useCustomMove();
   const username = "hongcha";

   useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchTransportSummary(username);
        setSummary(data);
      } catch (err) {
        console.error("대시보드 요약 정보를 불러오는 데 실패했습니다.", err);
      }
    };

    loadSummary();
  }, []);

   if (!summary) return <div>로딩 중...</div>;

  return (
    <div className="dashboard-row"> {/* ✅ 바깥 wrapper로 감싸기 */}
      <div className="header-box">
      <h2>👤 {summary.name}님 운송 현황</h2>
      <ul>
        <li>✅ 완료: {summary.completed}건</li>
        <li>🚚 진행중: {summary.inProgress}건</li>
        <li>📅 예정: {summary.scheduled}건</li>
        <li>📦 총 운송건수: {summary.total}건</li>
      </ul>
      <hr />
      <h3>💰 이번달 매출 요약</h3>
      <p>총 매출액: {summary.revenue.toLocaleString()}원</p>
      <p>수수료율: {summary.commission}%</p>
      <p>정산예정금액: {summary.settlement.toLocaleString()}원</p>
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