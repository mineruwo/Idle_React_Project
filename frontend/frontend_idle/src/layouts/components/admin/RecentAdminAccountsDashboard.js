import React from 'react';
import { getRecentlyCreatedAdmins, getRecentlyDeletedAdmins } from '../../../api/adminApi';
import useAdminAccountsData from '../../../hooks/useAdminAccountsData';
import './RecentAdminAccountsDashboard.css';

const pageSize = 5; // Max rows per table

const RecentAccountsList = ({ title, accounts, dateKey }) => (
    <div className="recent-section">
        <h4>{title}</h4>
        {accounts.length > 0 ? (
            <ul className="recent-list">
                {accounts.map(admin => (
                    <li key={admin.idIndex}>
                        <span>{admin.adminId} ({admin.name})</span>
                        <span className="date">{new Date(admin[dateKey]).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p>최근 {title.replace('최근 ', '')}이(가) 없습니다.</p>
        )}
    </div>
);

const RecentAdminAccountsDashboard = () => {
    const { 
        data: createdAdmins,
        loading: createdLoading,
        error: createdError,
    } = useAdminAccountsData(getRecentlyCreatedAdmins, pageSize);

    const { 
        data: deletedAdmins,
        loading: deletedLoading,
        error: deletedError,
    } = useAdminAccountsData(getRecentlyDeletedAdmins, pageSize);

    if (createdLoading || deletedLoading) {
        return <div>로딩 중...</div>;
    }

    if (createdError || deletedError) {
        return <div className="error-message">{createdError || deletedError}</div>;
    }

    return (
        <div className="recent-accounts-dashboard">
            <RecentAccountsList title="최근 생성된 관리자 계정" accounts={createdAdmins} dateKey="regDate" />
            <RecentAccountsList title="최근 삭제된 관리자 계정" accounts={deletedAdmins} dateKey="delDate" />
        </div>
    );
};

export default RecentAdminAccountsDashboard;
