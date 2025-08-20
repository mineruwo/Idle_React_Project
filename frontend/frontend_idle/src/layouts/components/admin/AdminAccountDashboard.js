import React, { useEffect, useState } from 'react';
import { renderAccountPanel } from '../../../utils/dashboardUtils';
import { Paper } from '@mui/material';
import './AdminAccountDashboard.css';
import { getRecentlyCreatedAdmins, getRecentlyDeletedAdmins } from '../../../api/adminApi';

const AdminAccountDashboard = () => {
    const [createdAdmins, setCreatedAdmins] = useState([]);
    const [deletedAdmins, setDeletedAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination and Date Range states for Created Admins
    const [createdAdminsPage, setCreatedAdminsPage] = useState(0);
    const [createdAdminsTotalPages, setCreatedAdminsTotalPages] = useState(0);
    const [createdAdminsDateRange, setCreatedAdminsDateRange] = useState('1day'); // Default to 1 day

    // Pagination and Date Range states for Deleted Admins
    const [deletedAdminsPage, setDeletedAdminsPage] = useState(0);
    const [deletedAdminsTotalPages, setDeletedAdminsTotalPages] = useState(0);
    const [deletedAdminsDateRange, setDeletedAdminsDateRange] = useState('1day'); // Default to 1 day

    const pageSize = 5; // Max rows per table

    useEffect(() => {
        const fetchCreatedAdmins = async () => {
            try {
                setLoading(true);
                const response = await getRecentlyCreatedAdmins(pageSize, createdAdminsPage, createdAdminsDateRange);
                setCreatedAdmins(response.content);
                setCreatedAdminsTotalPages(response.totalPages);
            } catch (err) {
                console.error("Failed to fetch recently created admins:", err);
                setError("최근 생성된 관리자 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchCreatedAdmins();
    }, [createdAdminsPage, createdAdminsDateRange]);

    useEffect(() => {
        const fetchDeletedAdmins = async () => {
            try {
                setLoading(true);
                const response = await getRecentlyDeletedAdmins(pageSize, deletedAdminsPage, deletedAdminsDateRange);
                setDeletedAdmins(response.content);
                setDeletedAdminsTotalPages(response.totalPages);
            } catch (err) {
                console.error("Failed to fetch recently deleted admins:", err);
                setError("최근 삭제된 관리자 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchDeletedAdmins();
    }, [deletedAdminsPage, deletedAdminsDateRange]);


    const handleCreatedAdminsPageChange = (newPage) => {
        setCreatedAdminsPage(newPage);
    };

    const handleDeletedAdminsPageChange = (newPage) => {
        setDeletedAdminsPage(newPage);
    };

    const handleCreatedAdminsDateRangeChange = (range) => {
        setCreatedAdminsDateRange(range);
        setCreatedAdminsPage(0); // Reset page when date range changes
    };

    const handleDeletedAdminsDateRangeChange = (range) => {
        setDeletedAdminsDateRange(range);
        setDeletedAdminsPage(0); // Reset page when date range changes
    };

    if (loading) {
        return (
            <Paper className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div>로딩 중...</div>
                </div>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div className="error-message">{error}</div>
                </div>
            </Paper>
        );
    }

    return (
        <Paper className="admin-dashboard-paper">
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
        </Paper>
    );
};

export default AdminAccountDashboard;
