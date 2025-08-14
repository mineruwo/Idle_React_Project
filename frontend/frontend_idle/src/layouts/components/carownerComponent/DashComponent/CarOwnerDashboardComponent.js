import React, { useEffect, useState } from "react";
import "../../../../theme/CarOwner/cardashboard.css";
import DashboardHeader from "../../../../layouts/components/carownerComponent/DashComponent/DashboardHeader";
import SalesChart from "../../../../layouts/components/carownerComponent/DashComponent/SalesChart";
import WarmPieChart from "../../../../layouts/components/carownerComponent/DashComponent/WarmPieChart";
import DeliveryList from "../../../../layouts/components/carownerComponent/DashComponent/DeliveryList";
import {
    fetchTransportSummary,
    fetchSalesChart,
    fetchDeliveries,
    fetchWarmth,
} from "../../../../api/CarOwnerApi/CarOwnerDashboardApi";

const CarOwnerDashboard = () => {
    const ownerId = "hongcha"; // 로그인 연동 예정

    const [summary, setSummary] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [warmth, setWarmth] = useState({ onTime: 0, late: 0 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const [s, sc, d, w] = await Promise.all([
                    fetchTransportSummary(ownerId),
                    fetchSalesChart(ownerId),
                    fetchDeliveries(ownerId),
                    fetchWarmth(ownerId),
                ]);
                setSummary(s);
                setSalesData(sc || []);
                setDeliveries(d || []);
                setWarmth(w || { onTime: 0, late: 0 });
            } catch (e) {
                console.error(e);
                setErr(e.message || "데이터 로딩 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, [ownerId]);

    if (loading) return <div className="dashboard-loading">로딩 중...</div>;
    if (err) return <div className="dashboard-error">에러: {String(err)}</div>;

    const warmthScore = (() => {
        const total = (warmth?.onTime || 0) + (warmth?.late || 0);
        return total === 0 ? 0 : Math.round((warmth.onTime / total) * 100);
    })();

    return (
        <>
            <div className="dashboard-container">
                <div className="dashborad-firstcontainer">

                    {/* ✅ 헤더와 WarmChart를 같은 행에 */}
                    <div className="dashboard-row">
                        {/* 헤더 카드 */}
                        <DashboardHeader
                            name={summary?.name}
                            completed={summary?.completed}
                            inProgress={summary?.inProgress}
                            scheduled={summary?.scheduled}
                            total={summary?.total}
                            revenue={summary?.revenue}
                            commission={summary?.commission}
                            settlement={summary?.settlement}
                        />

                        {/* WarmChart 카드 */}
                        <div className="warmth-alert">
                            <div className="warmthgraph">
                                <WarmPieChart onTime={warmth.onTime} late={warmth.late} />
                            </div>
                            <div className="warminfo">
                                <p>
                                    <strong>{summary?.name}님</strong>, 따뜻함 온도 💗 <strong>{warmthScore}</strong>
                                </p>
                                <p>🕒 {warmth.late === 0 ? "와우! 완벽합니다!" : "좋아요! 더 좋아질 수 있어요."}</p>
                            </div>
                        </div>
                    </div>

                    {/* 라인 차트 */}
                    <SalesChart data={salesData} />
                </div>
            </div>

            {/* 진행중 리스트 */}
            <div className="delbox">
                <DeliveryList deliveries={deliveries} />
            </div>
        </>
    );
};

export default CarOwnerDashboard;