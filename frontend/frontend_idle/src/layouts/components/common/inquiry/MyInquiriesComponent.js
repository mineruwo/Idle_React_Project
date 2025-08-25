import React from 'react';
import "../../../../CustomCSS/Inquiry.css";

const MyInquiriesComponent = ({ inquiries }) => {
    const columns = [
        { Header: '문의 번호', accessor: 'inquiryId' },
        { Header: '제목', accessor: 'inquiryTitle' },
        { Header: '작성일', accessor: 'createdAt' },
        { Header: '답변 상태', accessor: 'status' },
    ];

    return (
        <div className="inquiry-table-container">
            <h2 className="inquiry-title">내 문의 내역</h2>
            <table className="inquiry-table">
                <thead>
                    <tr>
                        {columns.map(column => (
                            <th key={column.accessor}>{column.Header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {inquiries && inquiries.length > 0 ? (
                        inquiries.map(row => (
                            <tr key={row.inquiryId}>
                                <td>{row.inquiryId}</td>
                                <td>{row.inquiryTitle}</td>
                                <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                                <td>{row.status}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                                문의 내역이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MyInquiriesComponent;