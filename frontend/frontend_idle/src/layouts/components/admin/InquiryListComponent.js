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

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllInquiries();
            const pendingInquiries = response.content.filter(
                (inquiry) => inquiry.status === 'INQUIRY_PENDING'
            );
            setInquiries(pendingInquiries);
        } catch (error) {
            setError('문의 내역을 불러오는 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleRowClick = (inquiry) => {
        setSelectedInquiry(inquiry);
    };

    const handleBackToList = () => {
        setSelectedInquiry(null);
    };

    const inquiryColumns = [
        { header: '문의 번호', key: 'inquiryId', sortable: true, render: (item) => item.inquiryId },
        { header: '제목', key: 'inquiryTitle', sortable: true, render: (item) => item.inquiryTitle },
        { header: '사용자 ID', key: 'customerIdNum', sortable: true, render: (item) => item.customerIdNum },
        { header: '문의일', key: 'createdAt', sortable: true, render: (item) => new Date(item.createdAt).toLocaleDateString() },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
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
                        <h2>상담 문의 관리 (답변 대기)</h2>
                    </div>
                    <AdminTable
                        data={inquiries}
                        columns={inquiryColumns}
                        sortConfig={{ key: 'inquiryId', direction: 'asc' }}
                        onSort={() => {}} // Sorting can be implemented later
                        onRowClick={handleRowClick}
                        emptyMessage="답변 대기 중인 문의가 없습니다."
                    />
                </>
            )}
        </div>
    );
};

export default InquiryListComponent;
