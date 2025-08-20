import React, { useEffect, useState } from 'react';
import { renderAccountPanel } from '../../../utils/dashboardUtils';
import { Paper } from '@mui/material';
import './CustomerAccountDashboard.css';
import { getRecentlyCreatedCustomers, getRecentlyDeletedCustomers, getDailyCustomerCreationCounts, getDailyCustomerDeletionCounts } from '../../../api/adminApi'; // Added getDailyCustomerDeletionCounts

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const CustomerAccountDashboard = () => {
    const [createdCustomers, setCreatedCustomers] = useState([]);
    const [deletedCustomers, setDeletedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination and Date Range states for Created Customers
    const [createdCustomersPage, setCreatedCustomersPage] = useState(0);
    const [createdCustomersTotalPages, setCreatedCustomersTotalPages] = useState(0);
    const [createdCustomersDateRange, setCreatedCustomersDateRange] = useState('1day'); // Default to 1 day

    // Pagination and Date Range states for Deleted Customers
    const [deletedCustomersPage, setDeletedCustomersPage] = useState(0);
    const [deletedCustomersTotalPages, setDeletedCustomersTotalPages] = useState(0);
    const [deletedCustomersDateRange, setDeletedCustomersDateRange] = useState('1day'); // Default to 1 day

    const [dailyCreationData, setDailyCreationData] = useState({});
    const [dailyDeletionData, setDailyDeletionData] = useState({}); // State for deletion chart data
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Current year

    const pageSize = 5; // Max rows per table

    useEffect(() => {
        const fetchCreatedCustomers = async () => {
            try {
                setLoading(true);
                const response = await getRecentlyCreatedCustomers(pageSize, createdCustomersPage, createdCustomersDateRange);
                setCreatedCustomers(response.content);
                setCreatedCustomersTotalPages(response.totalPages);
            } catch (err) {
                console.error("Failed to fetch recently created customers:", err);
                setError("최근 생성된 고객 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchCreatedCustomers();
    }, [createdCustomersPage, createdCustomersDateRange]);

    useEffect(() => {
        const fetchDeletedCustomers = async () => {
            try {
                setLoading(true);
                const response = await getRecentlyDeletedCustomers(pageSize, deletedCustomersPage, deletedCustomersDateRange);
                setDeletedCustomers(response.content);
                setDeletedCustomersTotalPages(response.totalPages);
            } catch (err) {
                console.error("Failed to fetch recently deleted customers:", err);
                setError("최근 삭제된 고객 계정 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchDeletedCustomers();
    }, [deletedCustomersPage, deletedCustomersDateRange]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                setChartLoading(true);
                const creationData = await getDailyCustomerCreationCounts(currentYear, currentMonth);
                const deletionData = await getDailyCustomerDeletionCounts(currentYear, currentMonth); // Fetch deletion data
                setDailyCreationData(creationData);
                setDailyDeletionData(deletionData);
            } catch (err) {
                console.error("Failed to fetch daily customer chart data:", err);
                setChartError("일별 고객 통계를 불러오는데 실패했습니다.");
            } finally {
                setChartLoading(false);
            }
        };
        fetchChartData();
    }, [currentYear, currentMonth]);


    const handleCreatedCustomersPageChange = (newPage) => {
        setCreatedCustomersPage(newPage);
    };

    const handleDeletedCustomersPageChange = (newPage) => {
        setDeletedCustomersPage(newPage);
    };

    const handleCreatedCustomersDateRangeChange = (range) => {
        setCreatedCustomersDateRange(range);
        setCreatedCustomersPage(0); // Reset page when date range changes
    };

    const handleDeletedCustomersDateRangeChange = (range) => {
        setDeletedCustomersDateRange(range);
        setDeletedCustomersPage(0); // Reset page when date range changes
    };

    // Prepare data for the chart
    const chartLabels = Object.keys(dailyCreationData).sort(); // Use creation data labels as base
    const creationDataValues = chartLabels.map(label => dailyCreationData[label] || 0);
    const deletionDataValues = chartLabels.map(label => dailyDeletionData[label] || 0);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: '일별 고객 생성 수',
                data: creationDataValues,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
            },
            {
                label: '일별 고객 삭제 수',
                data: deletionDataValues,
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${currentYear}년 ${currentMonth}월 일별 고객 통계`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Ensure integer ticks for counts
                },
            },
        },
    };

    // Generate years for dropdown
    const years = [];
    const currentYearFull = new Date().getFullYear();
    for (let i = currentYearFull - 5; i <= currentYearFull; i++) { // Last 5 years + current year
        years.push(i);
    }

    // Generate months for dropdown
    const months = Array.from({ length: 12 }, (_, i) => i + 1);


    if (loading || chartLoading) {
        return (
            <Paper className="customer-dashboard-paper">
                <div className="customer-dashboard-content">
                    <div>로딩 중...</div>
                </div>
            </Paper>
        );
    }

    if (error || chartError) {
        return (
            <Paper className="customer-dashboard-paper">
                <div className="customer-dashboard-content">
                    <div className="error-message">{error || chartError}</div>
                </div>
            </Paper>
        );
    }

    return (
        <Paper className="customer-dashboard-paper">
            <div className="customer-dashboard-content">
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
                        <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))}>
                            {years.map(year => <option key={year} value={year}>{year}년</option>)}
                        </select>
                        <select value={currentMonth} onChange={(e) => setCurrentMonth(parseInt(e.target.value))}>
                            {months.map(month => <option key={month} value={month}>{month}월</option>)}
                        </select>
                    </div>
                    <h3>{currentYear}년 {currentMonth}월 고객 생성 통계</h3>
                    {chartLoading ? (
                        <div>차트 로딩 중...</div>
                    ) : chartError ? (
                        <div className="error-message">{chartError}</div>
                    ) : (
                        <Line data={data} options={options} />
                    )}
                </div>

                <div className="recent-accounts-panels-container">
                    {renderAccountPanel(
                        '최근 생성된 고객 계정',
                        '생성일',
                        createdCustomers,
                        'customer',
                        createdCustomersDateRange,
                        handleCreatedCustomersDateRangeChange,
                        createdCustomersPage,
                        createdCustomersTotalPages,
                        handleCreatedCustomersPageChange
                    )}
                    {renderAccountPanel(
                        '최근 삭제된 고객 계정',
                        '삭제일',
                        deletedCustomers,
                        'customer',
                        deletedCustomersDateRange,
                        handleDeletedCustomersDateRangeChange,
                        deletedCustomersPage,
                        deletedCustomersTotalPages,
                        handleDeletedCustomersPageChange
                    )}
                </div>
            </div>
        </Paper>
    );
};

export default CustomerAccountDashboard;