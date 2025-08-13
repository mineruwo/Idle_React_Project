import React from 'react';
import '../../../theme/admin.css';

const InquiryListComponent = () => {
    // Mock data for demonstration
    const inquiries = [
        { id: 1, title: "결제 관련 문의", user: "user123", date: "2023-10-27", status: "답변 완료" },
        { id: 2, title: "배송 지연 문제", user: "shipper_A", date: "2023-10-26", status: "처리중" },
        { id: 3, title: "회원가입 오류", user: "newUser", date: "2023-10-25", status: "신규" },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>상담 문의 관리</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>문의 번호</th>
                        <th>제목</th>
                        <th>사용자</th>
                        <th>문의일</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries.map(inquiry => (
                        <tr key={inquiry.id} className="admin-table-row">
                            <td>{inquiry.id}</td>
                            <td>{inquiry.title}</td>
                            <td>{inquiry.user}</td>
                            <td>{inquiry.date}</td>
                            <td>{inquiry.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InquiryListComponent;