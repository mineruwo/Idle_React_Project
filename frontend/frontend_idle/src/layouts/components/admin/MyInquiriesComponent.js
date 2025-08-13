import React from 'react';
import '../../../theme/admin.css';

const MyInquiriesComponent = () => {
    // Mock data for demonstration
    const myInquiries = [
        { id: 1, title: "사용자 A의 배송 지연 문제", status: "처리 완료", assignedDate: "2023-10-25" },
        { id: 2, title: "사용자 B의 결제 오류 문의", status: "처리중", assignedDate: "2023-10-27" },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>내 상담 내역 확인</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>상담 번호</th>
                        <th>제목</th>
                        <th>상태</th>
                        <th>배정일</th>
                    </tr>
                </thead>
                <tbody>
                    {myInquiries.map(inquiry => (
                        <tr key={inquiry.id} className="admin-table-row">
                            <td>{inquiry.id}</td>
                            <td>{inquiry.title}</td>
                            <td>{inquiry.status}</td>
                            <td>{inquiry.assignedDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MyInquiriesComponent;