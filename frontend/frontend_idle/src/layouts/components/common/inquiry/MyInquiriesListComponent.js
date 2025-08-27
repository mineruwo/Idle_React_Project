import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill CSS
import { getInquiriesByCustomerId } from '../../../../api/inquiryApi';
import PaginationComponent from '../PaginationComponent';
import "../../../../CustomCSS/Inquiry.css";

const MyInquiriesListComponent = ({ currentUser }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const fetchInquiries = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const inquiriesData = await getInquiriesByCustomerId(currentUser.idNum, currentPage - 1);
            setInquiries(inquiriesData.content || []);
            setTotalPages(inquiriesData.totalPages || 0);
        } catch (err) {
            setError('문의 내역을 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentUser, currentPage]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleRowClick = (inquiryId) => {
        setExpandedRowId(expandedRowId === inquiryId ? null : inquiryId);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="inquiry-table-container">
            <h2 className="inquiry-title">내 문의 내역</h2>
            <table className="inquiry-table">
                <thead>
                    <tr>
                        <th>제목</th>
                        <th>작성일</th>
                        <th>답변 상태</th>
                    </tr>
                </thead>
                <tbody>
                    {inquiries && inquiries.length > 0 ? (
                        inquiries.map(row => (
                            <React.Fragment key={row.inquiryId}>
                                <tr onClick={() => handleRowClick(row.inquiryId)} className="inquiry-row-clickable">
                                    <td>{row.inquiryTitle}</td>
                                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                                    <td>{row.status === 'ANSWERED' ? '답변 완료' : '답변 대기'}</td>
                                </tr>
                                {expandedRowId === row.inquiryId && (
                                    <tr className="inquiry-details-row">
                                        <td colSpan="3">
                                            <div className="inquiry-details-content">
                                                <ReactQuill
                                                    value={row.inquiryContent}
                                                    readOnly={true}
                                                    theme="bubble"
                                                    modules={{
                                                        toolbar: false,
                                                    }}
                                                />
                                                {row.inquiryAnswer && (
                                                    <>
                                                        <hr />
                                                        <div dangerouslySetInnerHTML={{ __html: row.inquiryAnswer }}></div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>
                                문의 내역이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default MyInquiriesListComponent;
