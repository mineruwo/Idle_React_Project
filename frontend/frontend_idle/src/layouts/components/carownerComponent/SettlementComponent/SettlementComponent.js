// DeliverySettlementPage.js
import React from "react";
import "../../../../theme/CarOwner/Settlement.css";

const mockSummary = {
    totalSettlement: 1545000,
    period: "2024-04-01 ~ 2024-04-30",
    completed: {
        count: 15,
        sales: 2400000,
        commission: 855000,
        net: 1545000,
    },
    inProgress: {
        count: 3,
        estimatedSales: 530000,
        estimatedCommission: 190000,
    },
};

const mockDeliveries = [
    { date: "04.2.4", from: "서울", to: "부산", sales: 400000, commission: 140000, driverPay: 65000, net: 260000 },
    { date: "04.2.3", from: "인천", to: "대구", sales: 200000, commission: 130000, driverPay: 140000, net: 260000 },
    { date: "04.2.2", from: "대구", to: "청주", sales: 200000, commission: 140000, driverPay: 140000, net: 260000 },
    { date: "04.2.1", from: "서울", to: "부산", sales: 400000, commission: 140000, driverPay: 65000, net: 260000 },
    { date: "04.2.2", from: "인천", to: "대구", sales: 300000, commission: 140000, driverPay: 130000, net: 260000 },
    { date: "04.2.8", from: "서울", to: "서울", sales: 400000, commission: 35000, driverPay: 140000, net: 260000 },
];

const SettlementComponent = () => {
    return (
        <div className="settlement-page">
            <p>정산 기간: {mockSummary.period}</p>
            <div className="actions">
                <div className="settlementtitle">
                <h1>정산 금액: ₩{mockSummary.totalSettlement.toLocaleString()}</h1>
                
                </div>
                <div className="settlementprintbtn">
                <button>정산 인쇄</button>
                </div>
            </div>

            <div className="summary-section">
                <div className="box">
                    <h3>📦 배송 완료</h3>
                    <p>매출: {mockSummary.completed.count}건 / ₩{mockSummary.completed.sales.toLocaleString()}</p>
                    <p>수수료: ₩{mockSummary.completed.commission.toLocaleString()}</p>
                    <p className="total">정산금액: ₩{mockSummary.completed.net.toLocaleString()}</p>
                </div>

                <div className="box">
                    <h3>🚚 진행 중</h3>
                    <p>건수: {mockSummary.inProgress.count}건</p>
                    <p>예정 매출: ₩{mockSummary.inProgress.estimatedSales.toLocaleString()}</p>
                    <p>예정 수수료: ₩{mockSummary.inProgress.estimatedCommission.toLocaleString()}</p>
                </div>


            </div>

            <table className="delivery-table">
                <thead>
                    <tr>
                        <th>배송일</th>
                        <th>출발지</th>
                        <th>도착지</th>
                        <th>매출</th>
                        <th>수수료</th>
                        <th>정산지급액</th>
                        <th>정산액</th>
                    </tr>
                </thead>
                <tbody>
                    {mockDeliveries.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.date}</td>
                            <td>{item.from}</td>
                            <td>{item.to}</td>
                            <td>₩{item.sales.toLocaleString()}</td>
                            <td>₩{item.commission.toLocaleString()}</td>
                            <td>₩{item.driverPay.toLocaleString()}</td>
                            <td>₩{item.net.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SettlementComponent;
