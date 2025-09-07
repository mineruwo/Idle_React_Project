import React from 'react';
import '../../../theme/admin.css';

const SalesSummaryCards = ({ salesSummary, loading, error }) => {
    if (loading) return <p>매출 데이터 로딩 중...</p>;
    if (error) return <p>매출 데이터 로드 중 오류 발생: {error.message}</p>;

    if (!salesSummary) return null; // Don't render if no summary data

    return (
        <div className="sales-summary-cards">
            <div className="card">
                <h3>월 오더 총 갯수</h3>
                <p>{salesSummary.totalMonthlyOrders} 건</p>
            </div>
            <div className="card">
                <h3>금일 오더 갯수</h3>
                <p>{salesSummary.todayOrders} 건</p>
            </div>
            <div className="card">
                <h3>금일 거래 금액</h3>
                <p>{salesSummary.todayTransactionAmount?.toLocaleString() || '0'} 원</p>
            </div>
            <div className="card">
                <h3>이번 달 거래 금액</h3>
                <p>{salesSummary.thisMonthTransactionAmount?.toLocaleString() || '0'} 원</p>
            </div>
        </div>
    );
};

export default SalesSummaryCards;
