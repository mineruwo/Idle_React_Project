import React from 'react';
import { AdminTable } from './AdminTable'; // Reusing AdminTable
import '../../../theme/admin.css';

const InquiryListComponent = () => {
    // Mock data for demonstration
    const inquiries = [
        { id: 1, title: "결제 관련 문의", user: "user123", date: "2023-10-27", status: "답변 완료" },
        { id: 2, title: "배송 지연 문제", user: "shipper_A", date: "2023-10-26", status: "처리중" },
        { id: 3, title: "회원가입 오류", user: "newUser", date: "2023-10-25", status: "신규" },
    ];

    const inquiryColumns = [
        { header: '문의 번호', key: 'id', sortable: true, render: (item) => item.id },
        { header: '제목', key: 'title', sortable: true, render: (item) => item.title },
        { header: '사용자', key: 'user', sortable: true, render: (item) => item.user },
        { header: '문의일', key: 'date', sortable: true, render: (item) => item.date },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>상담 문의 관리</h2>
            </div>
            <AdminTable
                data={inquiries}
                columns={inquiryColumns}
                sortConfig={{ key: 'id', direction: 'asc' }} // Mock sort config
                onSort={() => {}} // Mock onSort
                emptyMessage="등록된 문의가 없습니다."
            />
        </div>
    );
};

export default InquiryListComponent;
