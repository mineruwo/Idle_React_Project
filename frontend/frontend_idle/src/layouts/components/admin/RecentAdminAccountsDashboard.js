import React, { useEffect, useState } from 'react';
import { getRecentlyCreatedAdmins, getRecentlyDeletedAdmins } from '../../../api/adminApi';
import './RecentAdminAccountsDashboard.css';

const RecentAdminAccountsDashboard = () => {
    const [createdAdmins, setCreatedAdmins] = useState([]);
    const [deletedAdmins, setDeletedAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentAdmins = async () => {
            try {
                setLoading(true);
                const created = await getRecentlyCreatedAdmins(5); // Fetch latest 5
                const deleted = await getRecentlyDeletedAdmins(5); // Fetch latest 5
                setCreatedAdmins(created);
                setDeletedAdmins(deleted);
            } catch (err) {
                console.error("Failed to fetch recent admin accounts:", err);
                setError("최근 관리자 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecentAdmins();
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
                <h4>최근 생성된 관리자 계정</h4>
                {createdAdmins.length > 0 ? (
                    <ul className="recent-list">
                        {createdAdmins.map(admin => (
                            <li key={admin.idIndex}>
                                <span>{admin.adminId} ({admin.name})</span>
                                <span className="date">{new Date(admin.regDate).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>최근 생성된 관리자 계정이 없습니다.</p>
                )}
            </div>
            <div className="recent-section">
                <h4>최근 삭제된 관리자 계정</h4>
                {deletedAdmins.length > 0 ? (
                    <ul className="recent-list">
                        {deletedAdmins.map(admin => (
                            <li key={admin.idIndex}>
                                <span>{admin.adminId} ({admin.name})</span>
                                <span className="date">{new Date(admin.delDate).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>최근 삭제된 관리자 계정이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default RecentAdminAccountsDashboard;
