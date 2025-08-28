import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/cardashboard.css";
import DashboardHeader from "../../../../layouts/components/carownerComponent/DashComponent/DashboardHeader";
import SalesChart from "../../../../layouts/components/carownerComponent/DashComponent/SalesChart";
import WarmPieChart from "../../../../layouts/components/carownerComponent/DashComponent/WarmPieChart";
import DeliveryList from "../../../../layouts/components/carownerComponent/DashComponent/DeliveryList";

import {
  fetchDeliveries,
  fetchSalesChart,
  fetchTransportSummary,
  fetchWarmth,
} from "../../../../api/CarOwnerApi/CarOwnerDashboard_deliveryApi";

// 정산 API
import {
  fetchSettlementSummaryCard,
} from "../../../../api/CarOwnerApi/CarOwnerSettlementApi";

// 이번 달 [from, to, ym] 계산
function monthRangeNow() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    from: toISO(start),
    to: toISO(end),
    ym: `${start.getFullYear()}-${pad(start.getMonth() + 1)}`,
  };
}

const CarOwnerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  // 리뷰 기반 따뜻함: { score(0~100), reviewCount, avgRating }
  const [warmth, setWarmth] = useState({ score: null, reviewCount: 0, avgRating: null });

  // 정산 요약카드
  const [settleCard, setSettleCard] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { from, to } = monthRangeNow();

        const [s, sc, d, w, card] = await Promise.all([
          fetchTransportSummary(),
          fetchSalesChart(),
          fetchDeliveries(),
          fetchWarmth(),                         // { score, reviewCount, avgRating }
          fetchSettlementSummaryCard({ from, to }),
        ]);

        setSummary(s);
        setSalesData(sc || []);
        setDeliveries(d || []);
        setWarmth(w || { score: null, reviewCount: 0, avgRating: null });
        setSettleCard(card || null);
      } catch (e) {
        setErr(e.message || "데이터 로딩 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshDeliveries = async () => {
    try {
      const d = await fetchDeliveries();
      setDeliveries(d || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="dashboard-loading">로딩 중...</div>;
  if (err) return <div className="dashboard-error">에러: {String(err)}</div>;

  // 정산값을 헤더에 연결
  const headerRevenue = settleCard?.totalAmount ?? 0;      // 총액(Brut)
  const headerCommission = settleCard?.totalCommission ?? 0; // 수수료
  const headerSettlement = settleCard?.netAmount ?? 0;       // 순수령(Net)

  const warmthScore = warmth?.score; // 폴백 없음

  return (
    <>
      <div className="dashboard-container">
        <div className="dashborad-firstcontainer">
          <div className="dashboard-row">
            <DashboardHeader
              name={summary?.nickname}
              completed={summary?.completed}
              inProgress={summary?.inProgress}
              scheduled={summary?.scheduled}
              total={summary?.total}
              revenue={headerRevenue}
              commission={headerCommission}
              settlement={headerSettlement}
            />

            {/* WarmChart 카드 (리뷰 기반 점수만 표시) */}
            <div className="warmth-alert">
              <div className="warmthgraph">
                <WarmPieChart score={warmthScore} />
              </div>
              <div className="warminfo">
                <p>
                  <strong>{summary?.nickname}님</strong>, 따뜻함 온도 💗{" "}
                  <strong>{warmthScore == null ? "—" : warmthScore}</strong>
                </p>
                {warmth?.reviewCount > 0 ? (
                  <>
                    <p>리뷰 {warmth.reviewCount}개, 평균 {warmth.avgRating?.toFixed?.(1) ?? warmth.avgRating}/5</p>
                    <p>
                      {warmthScore >= 90
                        ? "와우! 완벽합니다!"
                        : warmthScore >= 70
                        ? "좋아요! 더 좋아질 수 있어요."
                        : "꾸준한 서비스로 점수를 올려봐요."}
                    </p>
                  </>
                ) : (
                  <p>아직 받은 평가가 없어요.</p>
                )}
              </div>
            </div>
          </div>

          {/* 라인 차트 */}
          <SalesChart data={salesData} />
        </div>
      </div>

      {/* 진행중 리스트 */}
      <div className="delbox">
        <DeliveryList deliveries={deliveries} onRefresh={refreshDeliveries} />
      </div>
    </>
  );
};

export default CarOwnerDashboard;