import React from 'react';
import { AdminTable } from './AdminTable'; // Reusing AdminTable
import '../../../theme/admin.css';

const MyInquiriesComponent = () => {
    // Mock data for demonstration
    const myInquiries = [
        { id: 1, title: "사용자 A의 배송 지연 문제", status: "처리 완료", assignedDate: "2023-10-25" },
        { id: 2, title: "사용자 B의 결제 오류 문의", status: "처리중", assignedDate: "2023-10-27" },
    ];

    const myInquiriesColumns = [
        { header: '상담 번호', key: 'id', sortable: true, render: (item) => item.id },
        { header: '제목', key: 'title', sortable: true, render: (item) => item.title },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
        { header: '배정일', key: 'assignedDate', sortable: true, render: (item) => item.assignedDate },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>내 상담 내역 확인</h2>
            </div>
            <AdminTable
                data={myInquiries}
                columns={myInquiriesColumns}
                sortConfig={{ key: 'id', direction: 'asc' }} // Mock sort config
                onSort={() => {}} // Mock onSort
                emptyMessage="등록된 상담 내역이 없습니다."
            />
        </div>
    );
};

export default MyInquiriesComponent;