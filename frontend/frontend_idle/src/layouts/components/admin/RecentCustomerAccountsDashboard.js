import React, { useEffect, useState } from 'react';
import { getRecentlyCreatedCustomers, getRecentlyDeletedCustomers } from '../../../api/adminApi';
import './RecentCustomerAccountsDashboard.css';

const RecentCustomerAccountsDashboard = () => {
    const [createdCustomers, setCreatedCustomers] = useState([]);
    const [deletedCustomers, setDeletedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentCustomers = async () => {
            try {
                setLoading(true);
                const created = await getRecentlyCreatedCustomers(5); // Fetch latest 5
                const deleted = await getRecentlyDeletedCustomers(5); // Fetch latest 5
                setCreatedCustomers(created);
                setDeletedCustomers(deleted);
            } catch (err) {
                console.error("Failed to fetch recent customer accounts:", err);
                setError("최근 고객 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecentCustomers();
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="recent-accounts-dashboard">
            <div className="recent-section">
                <h4>최근 생성된 고객 계정</h4>
                {createdCustomers.length > 0 ? (
                    <ul className="recent-list">
                        {createdCustomers.map(customer => (
                            <li key={customer.id}>
                                <span>{customer.customName} ({customer.id})</span>
                                <span className="date">{new Date(customer.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>최근 생성된 고객 계정이 없습니다.</p>
                )}
            </div>
            <div className="recent-section">
                <h4>최근 삭제된 고객 계정</h4>
                {deletedCustomers.length > 0 ? (
                    <ul className="recent-list">
                        {deletedCustomers.map(customer => (
                            <li key={customer.id}>
                                <span>{customer.customName} ({customer.id})</span>
                                <span className="date">{new Date(customer.leftedAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>최근 삭제된 고객 계정이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default RecentCustomerAccountsDashboard;
