import React from 'react';
import PaginationComponent from '../layouts/components/common/PaginationComponent';
import AdminCard from '../layouts/components/common/AdminCard';
import AdminButton from '../layouts/components/common/AdminButton';

export const renderAccountPanel = (title, dateColumnName, data, type, dateRange, onDateRangeChange, currentPage, totalPages, onPageChange) => {
    return (
        <AdminCard title={title}>
            <div className="dashboard-date-filters"> {/* New class for date filters container */}
                {/* <h4>{title}</h4> -- Title is now handled by AdminCard */}
                {/* Removed extra div around AdminButtons */}
                <AdminButton
                    variant="filter" // Use filter variant for these buttons
                    isActive={dateRange === '1day'}
                    onClick={() => onDateRangeChange('1day')}
                >
                    1일
                </AdminButton>
                <AdminButton
                    variant="filter" // Use filter variant for these buttons
                    isActive={dateRange === '1week'}
                    onClick={() => onDateRangeChange('1week')}
                >
                    1주일
                </AdminButton>
                <AdminButton
                    variant="filter" // Use filter variant for these buttons
                    isActive={dateRange === '1month'}
                    onClick={() => onDateRangeChange('1month')}
                >
                    1달
                </AdminButton>
            </div>
            <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                    <tr>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>권한</th>
                        <th>{dateColumnName}</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item.idIndex || item.id || index}><td>{item.adminId || item.id}</td><td>{item.name || item.customName}</td><td>{item.role}</td><td>{new Date(item.regDate || item.createdAt || item.delDate || item.leftedAt).toLocaleDateString()}</td></tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>데이터가 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                maxVisibleButtons={3} // Set maxVisibleButtons to 3 for dashboard
            />
        </AdminCard>
    );
};