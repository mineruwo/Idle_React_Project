import React from 'react';
import '../../../theme/admin.css';

const SalesDetailComponent = () => {
    // Mock data for demonstration
    const salesData = [
        { id: 'TX12345', date: '2023-10-27', amount: '55,000원', customer: 'user123', status: '완료' },
        { id: 'TX12346', date: '2023-10-27', amount: '120,000원', customer: 'shipper_A', status: '완료' },
        { id: 'TX12347', date: '2023-10-26', amount: '78,000원', customer: 'newUser', status: '완료' },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 상세 보기</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>거래 ID</th>
                        <th>날짜</th>
                        <th>금액</th>
                        <th>고객</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData.map(sale => (
                        <tr key={sale.id} className="admin-table-row">
                            <td>{sale.id}</td>
                            <td>{sale.date}</td>
                            <td>{sale.amount}</td>
                            <td>{sale.customer}</td>
                            <td>{sale.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesDetailComponent;