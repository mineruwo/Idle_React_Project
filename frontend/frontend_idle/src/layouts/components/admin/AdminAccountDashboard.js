import React from 'react';
import { renderAccountPanel } from '../../../utils/dashboardUtils';
import { getRecentlyCreatedAdmins, getRecentlyDeletedAdmins } from '../../../api/adminApi';
import useAdminAccountsData from '../../../hooks/useAdminAccountsData';

const pageSize = 5; // Max rows per table

const AdminAccountDashboard = () => {
    const { 
        data: createdAdmins,
        loading: createdLoading,
        error: createdError,
        page: createdAdminsPage,
        totalPages: createdAdminsTotalPages,
        dateRange: createdAdminsDateRange,
        handlePageChange: handleCreatedAdminsPageChange,
        handleDateRangeChange: handleCreatedAdminsDateRangeChange,
    } = useAdminAccountsData(getRecentlyCreatedAdmins, pageSize);

    const { 
        data: deletedAdmins,
        loading: deletedLoading,
        error: deletedError,
        page: deletedAdminsPage,
        totalPages: deletedAdminsTotalPages,
        dateRange: deletedAdminsDateRange,
        handlePageChange: handleDeletedAdminsPageChange,
        handleDateRangeChange: handleDeletedAdminsDateRangeChange,
    } = useAdminAccountsData(getRecentlyDeletedAdmins, pageSize);

    if (createdLoading || deletedLoading) {
        return (
            <div className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div>로딩 중...</div>
                </div>
            </div>
        );
    }

    if (createdError || deletedError) {
        return (
            <div className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div className="error-message">{createdError || deletedError}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-paper">
            <div className="admin-dashboard-content">
                <div className="recent-accounts-panels-container">
                    {renderAccountPanel(
                        '최근 생성된 관리자 계정',
                        '생성일',
                        createdAdmins,
                        'admin',
                        createdAdminsDateRange,
                        handleCreatedAdminsDateRangeChange,
                        createdAdminsPage,
                        createdAdminsTotalPages,
                        handleCreatedAdminsPageChange
                    )}
                    {renderAccountPanel(
                        '최근 삭제된 관리자 계정',
                        '삭제일',
                        deletedAdmins,
                        'admin',
                        deletedAdminsDateRange,
                        handleDeletedAdminsDateRangeChange,
                        deletedAdminsPage,
                        deletedAdminsTotalPages,
                        handleDeletedAdminsPageChange
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAccountDashboard;
