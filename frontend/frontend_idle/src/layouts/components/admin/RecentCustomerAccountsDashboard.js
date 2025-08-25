import React from 'react';
import { getRecentlyCreatedCustomers, getRecentlyDeletedCustomers } from '../../../api/adminApi';
import useAdminAccountsData from '../../../hooks/useAdminAccountsData';
import './RecentCustomerAccountsDashboard.css';

// Reusing the RecentAccountsList component from AdminAccountDashboard
const RecentAccountsList = ({ title, accounts, idKey, nameKey, dateKey }) => (
    <div className="recent-section">
        <h4>{title}</h4>
        {accounts.length > 0 ? (
            <ul className="recent-list">
                {accounts.map(customer => (
                    <li key={customer[idKey]}>
                        <span>{customer[nameKey]} ({customer[idKey]})</span>
                        <span className="date">{new Date(customer[dateKey]).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p>최근 {title.replace('최근 ', '')}이(가) 없습니다.</p>
        )}
    </div>
);

const pageSize = 5; // Max rows per table

const RecentCustomerAccountsDashboard = () => {
    const { 
        data: createdCustomers,
        loading: createdLoading,
        error: createdError,
    } = useAdminAccountsData(getRecentlyCreatedCustomers, pageSize);

    const { 
        data: deletedCustomers,
        loading: deletedLoading,
        error: deletedError,
    } = useAdminAccountsData(getRecentlyDeletedCustomers, pageSize);

    if (createdLoading || deletedLoading) {
        return <div>로딩 중...</div>;
    }

    if (createdError || deletedError) {
        return <div className="error-message">{createdError || deletedError}</div>;
    }

    return (
        <div className="recent-accounts-dashboard">
            <RecentAccountsList 
                title="최근 생성된 고객 계정" 
                accounts={createdCustomers} 
                idKey="id" 
                nameKey="customName" 
                dateKey="createdAt" 
            />
            <RecentAccountsList 
                title="최근 삭제된 고객 계정" 
                accounts={deletedCustomers} 
                idKey="id" 
                nameKey="customName" 
                dateKey="leftedAt" 
            />
        </div>
    );
};

export default RecentCustomerAccountsDashboard;
