import React from 'react';
import '../../../theme/admin.css';

const SalesSettlementComponent = () => {
    // Mock data for demonstration
    const settlementData = [
        { id: 'SETTLE-001', period: '2023-10-01 ~ 2023-10-15', amount: '1,250,000원', status: '완료' },
        { id: 'SETTLE-002', period: '2023-10-16 ~ 2023-10-31', amount: '2,300,000원', status: '진행중' },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 정산 관리</h2>
                <button className="admin-primary-btn">새 정산 생성</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>정산 ID</th>
                        <th>정산 기간</th>
                        <th>정산 금액</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {settlementData.map(settlement => (
                        <tr key={settlement.id} className="admin-table-row">
                            <td>{settlement.id}</td>
                            <td>{settlement.period}</td>
                            <td>{settlement.amount}</td>
                            <td>{settlement.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesSettlementComponent;