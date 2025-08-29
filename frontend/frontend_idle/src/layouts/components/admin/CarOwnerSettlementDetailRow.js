import React, { useState, useEffect } from 'react';
import AdminButton from '../common/AdminButton';
import { AdminTable } from './AdminTable';
import { getCustomerById } from '../../../api/adminApi';

// Helper component to fetch and display owner's name
const OwnerIdCell = ({ ownerId }) => {
    const [ownerName, setOwnerName] = useState(null);

    useEffect(() => {
        const fetchOwnerName = async () => {
            // Ensure ownerId is not null/undefined before parsing
            if (ownerId === null || ownerId === undefined) {
                setOwnerName(''); // Or some other placeholder
                return;
            }

            const numericId = parseInt(ownerId, 10);

            if (!isNaN(numericId) && numericId > 0) { // Check for valid positive integer
                try {
                    const customer = await getCustomerById(numericId);
                    setOwnerName(customer.name || customer.username || ownerId);
                } catch (error) {
                    console.error(`Failed to fetch customer name for id ${numericId}:`, error);
                    setOwnerName(ownerId); // Fallback to showing the original ID
                }
            } else {
                setOwnerName(ownerId); // If not a valid number, just display it
            }
        };

        fetchOwnerName();
    }, [ownerId]);

    return <span>{ownerName === null ? '로딩 중...' : ownerName}</span>;
};


const CarOwnerSettlementDetailRow = ({ item, handleUpdateStatus }) => {
    const statusMap = {
        REQUESTED: '요청됨',
        APPROVED: '승인됨',
        PAID: '지급됨',
        CANCELED: '취소됨',
    };

    const keyLabelMap = {
        id: '정산 ID',
        createdAt: '신청일',
        totalAmount: '총 금액',
        netAmount: '순 금액',
        status: '상태',
        ownerId: '차주 ID', // Corrected key
        yearMonth: '정산연월',
        settlementDetails: '정산 상세 내역' // To filter this out from the main table
    };

    const detailColumns = [
        { header: '상세 ID', key: 'id' },
        { header: '예약 ID', key: 'reservationId' },
        { header: '금액', key: 'amount', render: (detail) => `${detail.amount.toLocaleString()}원` },
        { header: '수수료', key: 'fee', render: (detail) => `${detail.fee.toLocaleString()}원` },
        { header: '지급액', key: 'paidAmount', render: (detail) => `${detail.paidAmount.toLocaleString()}원` },
        { header: '예약일', key: 'reservationDate', render: (detail) => new Date(detail.reservationDate).toLocaleDateString() },
    ];

    const renderValue = (key, value) => {
        if (value === null || value === undefined) {
            return '';
        }
        if (key === 'ownerId') { // Corrected key
            return <OwnerIdCell ownerId={value} />;
        }
        if (key === 'status') {
            return statusMap[value] || value;
        }
        if (key === 'createdAt') {
            return new Date(value).toLocaleString();
        }
        if (key === 'totalAmount' || key === 'netAmount') {
            return `${value.toLocaleString()}원`;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value;
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <h4 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '15px', color: '#007bff' }}>
                정산 상세 정보 (ID: {item.id})
            </h4>
            
            <table className="admin-table" style={{ marginBottom: '20px' }}>
                <tbody>
                    {Object.entries(item).map(([key, value]) => {
                        if (key === 'settlementDetails') return null; // Skip details array
                        return (
                            <tr key={key}>
                                <td style={{ width: '200px', fontWeight: 'bold', backgroundColor: '#e9ecef' }}>{keyLabelMap[key] || key}</td>
                                <td>{renderValue(key, value)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {item.settlementDetails && item.settlementDetails.length > 0 && (
                <>
                    <h5 style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '12px' }}>정산 상세 내역</h5>
                    <AdminTable
                        columns={detailColumns}
                        data={item.settlementDetails}
                        emptyMessage="상세 내역이 없습니다."
                    />
                </>
            )}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #007bff', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <AdminButton variant="primary" onClick={() => handleUpdateStatus(item.id, 'APPROVED')}>승인</AdminButton>
                <AdminButton variant="success" onClick={() => handleUpdateStatus(item.id, 'PAID')}>지급 완료</AdminButton>
                <AdminButton variant="danger" onClick={() => handleUpdateStatus(item.id, 'CANCELED')}>취소</AdminButton>
            </div>
        </div>
    );
};

export default CarOwnerSettlementDetailRow;
