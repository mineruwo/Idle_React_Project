import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable'; // Reusing AdminTable
import AdminButton from '../common/AdminButton'; // Import AdminButton
import { getCarOwnerSettlementBatches, updateCarOwnerSettlementStatus } from '../../../api/adminApi'; // New API import
import CarOwnerSettlementDetailRow from './CarOwnerSettlementDetailRow'; // Import new component
import '../../../theme/admin.css';

const SalesSettlementComponent = () => {
    const [settlementData, setSettlementData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [ownerIdFilter, setOwnerIdFilter] = useState('');
    const [yearMonthFilter, setYearMonthFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedRowId, setExpandedRowId] = useState(null); // State for expanded row

    const fetchSettlements = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                size,
                ownerId: ownerIdFilter,
                yearMonth: yearMonthFilter,
                status: statusFilter,
            };
            const response = await getCarOwnerSettlementBatches(params);
            setSettlementData(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlements();
    }, [page, size, ownerIdFilter, yearMonthFilter, statusFilter]);

    const statusMap = {
        REQUESTED: '요청됨',
        APPROVED: '승인됨',
        PAID: '지급됨',
        CANCELED: '취소됨',
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateCarOwnerSettlementStatus(id, newStatus);
            alert(`정산 ${id}의 상태가 ${statusMap[newStatus] || newStatus}으로 변경되었습니다.`);
            fetchSettlements(); // Refetch data after update
        } catch (err) {
            alert(`상태 변경 실패: ${err.message}`);
            console.error('Failed to update status:', err);
        }
    };

    const handleRowClick = (item) => {
        const rowId = item.id;
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    const settlementColumns = [
        { header: '정산 ID', key: 'id', sortable: true, render: (item) => item.id },
        { header: '신청일', key: 'createdAt', sortable: true, render: (item) => new Date(item.createdAt).toLocaleDateString() },
        { header: '총 금액', key: 'totalAmount', sortable: true, render: (item) => item.totalAmount },
        { header: '순 금액', key: 'netAmount', sortable: true, render: (item) => item.netAmount },
        { header: '상태', key: 'status', sortable: true, render: (item) => statusMap[item.status] || item.status },
    ];

    // Function to generate month options for filter
    const generateMonthOptions = () => {
        const options = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1; // 1-indexed

        for (let i = 0; i < 12; i++) { // Generate options for the last 12 months
            let year = currentYear;
            let month = currentMonth - i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            const monthString = month < 10 ? `0${month}` : `${month}`;
            options.push(`${year}-${monthString}`);
        }
        return options.reverse(); // Show most recent first
    };

    const monthOptions = generateMonthOptions();

    const handleSearch = () => {
        setPage(0); // Reset to first page on new search
        fetchSettlements(); // Trigger data fetch with current filters
    };

    const renderExpandedRowContent = (item) => (
        <td colSpan={settlementColumns.length}>
            <CarOwnerSettlementDetailRow item={item} handleUpdateStatus={handleUpdateStatus} />
        </td>
    );

    if (loading) {
        return <div className="admin-container">로딩 중...</div>;
    }

    if (error) {
        return <div className="admin-container">오류 발생: {error.message}</div>;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 정산 관리</h2>
                <AdminButton variant="primary">새 정산 생성</AdminButton>
            </div>

            {/* Filter Controls */}
            <div className="filter-controls" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="차주 ID 검색"
                    value={ownerIdFilter}
                    onChange={(e) => setOwnerIdFilter(e.target.value)}
                    style={{ marginRight: '10px', padding: '8px' }}
                />
                <select
                    value={yearMonthFilter}
                    onChange={(e) => setYearMonthFilter(e.target.value)}
                    style={{ marginRight: '10px', padding: '8px' }}
                >
                    <option value="">월별 필터 (전체)</option>
                    {monthOptions.map(ym => <option key={ym} value={ym}>{ym}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ marginRight: '10px', padding: '8px' }}
                >
                    <option value="">상태 필터 (전체)</option>
                    {Object.keys(statusMap).map(key => (
                        <option key={key} value={key}>{statusMap[key]}</option>
                    ))}
                </select>
                <AdminButton variant="primary" onClick={handleSearch}>검색</AdminButton>
            </div>

            <AdminTable
                data={settlementData}
                columns={settlementColumns}
                sortConfig={{ key: 'id', direction: 'asc' }} // Mock sort config
                onSort={() => {}} // Mock onSort
                emptyMessage="등록된 정산 데이터가 없습니다."
                onRowClick={handleRowClick} // Add onRowClick prop
                selectedRowId={expandedRowId} // Pass expandedRowId
                renderExpandedContent={renderExpandedRowContent}
            />

            {/* Pagination controls */}
            <div className="pagination-controls">
                <button onClick={() => setPage(prev => Math.max(0, prev - 1))} disabled={page === 0}>이전</button>
                <span>페이지 {page + 1} / {totalPages}</span>
                <button onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))} disabled={page === totalPages - 1}>다음</button>
            </div>
        </div>
    );
};

export default SalesSettlementComponent;
