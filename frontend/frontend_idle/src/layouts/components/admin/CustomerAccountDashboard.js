import React, { useEffect, useState } from "react";
import { renderAccountPanel } from "../../../utils/dashboardUtils";
import AdminSelect from "../common/AdminSelect"; // Import AdminSelect
import AdminCard from "../common/AdminCard"; // Import AdminCard
import AdminChartCard from "../common/AdminChartCard"; // Import AdminChartCard
import {
    getRecentlyCreatedCustomers,
    getRecentlyDeletedCustomers,
    getDailyCustomerCreationCounts,
    getDailyCustomerDeletionCounts,
} from "../../../api/adminApi"; // Added getDailyCustomerCreationCounts

const CustomerAccountDashboard = () => {
    const [createdCustomers, setCreatedCustomers] = useState([]);
    const [deletedCustomers, setDeletedCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination and Date Range states for Created Customers
    const [createdCustomersPage, setCreatedCustomersPage] = useState(0);
    const [createdCustomersTotalPages, setCreatedCustomersTotalPages] =
        useState(0);
    const [createdCustomersDateRange, setCreatedCustomersDateRange] =
        useState("1day"); // Default to 1 day

    // Pagination and Date Range states for Deleted Customers
    const [deletedCustomersPage, setDeletedCustomersPage] = useState(0);
    const [deletedCustomersTotalPages, setDeletedCustomersTotalPages] =
        useState(0);
    const [deletedCustomersDateRange, setDeletedCustomersDateRange] =
        useState("1day"); // Default to 1 day

    const [dailyCreationData, setDailyCreationData] = useState({});
    const [dailyDeletionData, setDailyDeletionData] = useState({}); // State for deletion chart data
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year

    const pageSize = 5; // Max rows per table

    useEffect(() => {
        const fetchCreatedCustomers = async () => {
            try {
                setLoading(true);
                const response = await getRecentlyCreatedCustomers(
                    pageSize,
                    createdCustomersPage,
                    createdCustomersDateRange
                );
                setCreatedCustomers(response.content);
                setCreatedCustomersTotalPages(response.totalPages);
            } catch (err) {
                console.error(
                    "Failed to fetch recently created customers:",
                    err
                );
                setError(
                    "최근 생성된 고객 계정 정보를 불러오는데 실패했습니다."
                );
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
                const response = await getRecentlyDeletedCustomers(
                    pageSize,
                    deletedCustomersPage,
                    deletedCustomersDateRange
                );
                setDeletedCustomers(response.content);
                setDeletedCustomersTotalPages(response.totalPages);
            } catch (err) {
                console.error(
                    "Failed to fetch recently deleted customers:",
                    err
                );
                setError(
                    "최근 삭제된 고객 계정 정보를 불러오는데 실패했습니다."
                );
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
                const creationData = await getDailyCustomerCreationCounts(
                    selectedYear,
                    selectedMonth
                );
                const deletionData = await getDailyCustomerDeletionCounts(
                    selectedYear,
                    selectedMonth
                ); // Fetch deletion data
                setDailyCreationData(creationData);
                setDailyDeletionData(deletionData);
            } catch (err) {
                console.error(
                    "Failed to fetch daily customer chart data:",
                    err
                );
                setChartError("일별 고객 통계를 불러오는데 실패했습니다.");
            } finally {
                setChartLoading(false);
            }
        };
        fetchChartData();
    }, [selectedYear, selectedMonth]);

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
    const creationDataValues = chartLabels.map(
        (label) => dailyCreationData[label] || 0
    );
    const deletionDataValues = chartLabels.map(
        (label) => dailyDeletionData[label] || 0
    );

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: "일별 고객 생성 수",
                data: creationDataValues,
                fill: false,
                backgroundColor: "rgb(75, 192, 192)",
                borderColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.1,
            },
            {
                label: "일별 고객 삭제 수",
                data: deletionDataValues,
                fill: false,
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `${selectedYear}년 ${selectedMonth}월 일별 고객 통계`,
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
    const years = Array.from(
        { length: 6 },
        (_, i) => new Date().getFullYear() - i
    ).reverse(); // Current year and 5 years prior
    // Generate months for dropdown
    const months = Array.from(
        {
            length:
                selectedYear === new Date().getFullYear()
                    ? new Date().getMonth() + 1
                    : 12,
        },
        (_, i) => i + 1
    );

    if (loading || chartLoading) {
        return (
            <div className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div>로딩 중...</div>
                </div>
            </div>
        );
    }

    if (error || chartError) {
        return (
            <div className="admin-dashboard-paper">
                <div className="admin-dashboard-content">
                    <div className="error-message">{error || chartError}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-paper">
            <div className="customer-dashboard-content">
                <AdminChartCard
                    title={`${selectedYear}년 ${selectedMonth}월 고객 생성 통계`}
                    chartData={data}
                    chartOptions={options}
                    loading={chartLoading}
                    error={chartError}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    setSelectedYear={setSelectedYear}
                    setSelectedMonth={setSelectedMonth}
                    years={years}
                    months={months}
                />

                <div className="recent-accounts-panels-container">
                    {renderAccountPanel(
                        "최근 생성된 고객 계정",
                        "생성일",
                        createdCustomers,
                        "customer",
                        createdCustomersDateRange,
                        handleCreatedCustomersDateRangeChange,
                        createdCustomersPage,
                        createdCustomersTotalPages,
                        handleCreatedCustomersPageChange
                    )}
                    {renderAccountPanel(
                        "최근 삭제된 고객 계정",
                        "삭제일",
                        deletedCustomers,
                        "customer",
                        deletedCustomersDateRange,
                        handleDeletedCustomersDateRangeChange,
                        deletedCustomersPage,
                        deletedCustomersTotalPages,
                        handleDeletedCustomersPageChange
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerAccountDashboard;