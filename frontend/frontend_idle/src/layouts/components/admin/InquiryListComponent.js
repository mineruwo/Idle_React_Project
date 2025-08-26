import React, { useState, useEffect, useCallback } from 'react';
import { AdminTable } from './AdminTable';
import InquiryDetailComponent from './InquiryDetailComponent';
import CustomerInfoSidebar from './CustomerInfoSidebar';
import '../../../theme/admin.css';
import { getAllInquiries } from '../../../api/inquiryApi';

const InquiryListComponent = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [statusFilter, setStatusFilter] = useState(''); // '' for all, or specific status
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // For pagination
    const [totalPages, setTotalPages] = useState(0); // For pagination

    const fetchInquiries = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            // Pass statusFilter and searchQuery to the API call
            const response = await getAllInquiries(page, 10, statusFilter, searchQuery); // Assuming size 10
            setInquiries(response.content);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch (error) {
            setError('문의 내역을 불러오는 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery]); // Depend on filters

    useEffect(() => {
        fetchInquiries(currentPage);
    }, [fetchInquiries, currentPage]);

    const handleRowClick = (inquiry) => {
        setSelectedInquiry(inquiry);
    };

    const handleBackToList = () => {
        setSelectedInquiry(null);
        fetchInquiries(currentPage); // Refresh list after returning from detail
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const inquiryColumns = [
        { header: '문의 번호', key: 'inquiryId', sortable: true, render: (item) => item.inquiryId },
        { header: '제목', key: 'inquiryTitle', sortable: true, render: (item) => item.inquiryTitle },
        { header: '사용자 ID', key: 'customerIdNum', sortable: true, render: (item) => item.customerIdNum },
        { header: '문의일', key: 'createdAt', sortable: true, render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
    ];

    const inquiryStatuses = [
        { value: '', label: '전체' },
        { value: 'INQUIRY_PENDING', label: '답변 대기' },
        { value: 'IN_PROGRESS', label: '처리 중' },
        { value: 'ANSWERED', label: '답변 완료' },
        { value: 'RE_INQUIRY', label: '재문의' },
    ];

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="admin-container">
            {selectedInquiry ? (
                <div style={{ display: 'flex' }}>
                    <div style={{ flex: 3, marginRight: '20px' }}>
                        <InquiryDetailComponent 
                            inquiry={selectedInquiry} 
                            onBackToList={handleBackToList}
                            refreshInquiries={fetchInquiries} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <CustomerInfoSidebar customerId={selectedInquiry.customerIdNum} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="admin-header">
                        <h2>상담 문의 관리</h2>
                        <div className="inquiry-filters">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                {inquiryStatuses.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <input 
                                type="text" 
                                placeholder="문의 번호, 제목, 사용자 ID 검색" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') fetchInquiries(0); }} // Trigger search on Enter
                                className="search-input"
                            />
                            <button onClick={() => fetchInquiries(0)} className="search-button">검색</button>
                        </div>
                    </div>
                    <AdminTable
                        data={inquiries}
                        columns={inquiryColumns}
                        sortConfig={{ key: 'inquiryId', direction: 'asc' }}
                        onSort={() => {}} // Sorting can be implemented later
                        onRowClick={handleRowClick}
                        emptyMessage="조회된 문의가 없습니다."
                    />
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>이전</button>
                            <span>{currentPage + 1} / {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>다음</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InquiryListComponent;
