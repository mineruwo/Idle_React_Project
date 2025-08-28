import React from 'react';
import { AdminTable } from './AdminTable'; // Reusing AdminTable
import AdminButton from '../common/AdminButton'; // Import AdminButton
import '../../../theme/admin.css';

const SalesSettlementComponent = () => {
    // Mock data for demonstration
    const settlementData = [
        { id: 'SETTLE-001', period: '2023-10-01 ~ 2023-10-15', amount: '1,250,000원', status: '완료' },
        { id: 'SETTLE-002', period: '2023-10-16 ~ 2023-10-31', amount: '2,300,000원', status: '진행중' },
    ];

    const settlementColumns = [
        { header: '정산 ID', key: 'id', sortable: true, render: (item) => item.id },
        { header: '정산 기간', key: 'period', sortable: true, render: (item) => item.period },
        { header: '정산 금액', key: 'amount', sortable: true, render: (item) => item.amount },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 정산 관리</h2>
                <AdminButton variant="primary">새 정산 생성</AdminButton> 
            </div>
            <AdminTable
                data={settlementData}
                columns={settlementColumns}
                sortConfig={{ key: 'id', direction: 'asc' }} // Mock sort config
                onSort={() => {}} // Mock onSort
                emptyMessage="등록된 정산 데이터가 없습니다."
            />
        </div>
    );
};

export default SalesSettlementComponent;
