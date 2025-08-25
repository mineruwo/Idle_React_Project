import React from 'react';
import { AdminTable } from './AdminTable'; // Reusing AdminTable
import '../../../theme/admin.css';

const SalesDetailComponent = () => {
    // Mock data for demonstration
    const salesData = [
        { id: 'TX12345', date: '2023-10-27', amount: '55,000원', customer: 'user123', status: '완료' },
        { id: 'TX12346', date: '2023-10-27', amount: '120,000원', customer: 'shipper_A', status: '완료' },
        { id: 'TX12347', date: '2023-10-26', amount: '78,000원', customer: 'newUser', status: '완료' },
    ];

    const salesColumns = [
        { header: '거래 ID', key: 'id', sortable: true, render: (item) => item.id },
        { header: '날짜', key: 'date', sortable: true, render: (item) => item.date },
        { header: '금액', key: 'amount', sortable: true, render: (item) => item.amount },
        { header: '고객', key: 'customer', sortable: true, render: (item) => item.customer },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 상세 보기</h2>
            </div>
            <AdminTable
                data={salesData}
                columns={salesColumns}
                sortConfig={{ key: 'id', direction: 'asc' }} // Mock sort config
                onSort={() => {}} // Mock onSort
                emptyMessage="등록된 매출 데이터가 없습니다."
            />
        </div>
    );
};

export default SalesDetailComponent;
