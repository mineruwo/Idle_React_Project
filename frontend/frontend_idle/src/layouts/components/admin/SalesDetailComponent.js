import React, { useState, useMemo, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import '../../../theme/admin.css';
import useSalesData from '../../../hooks/useSalesData';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import SalesSummaryCards from './SalesSummaryCards';
import { format, getDaysInMonth, parseISO, startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SalesDetailComponent = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const firstDayOfMonth = format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd');
        const lastDayOfMonth = format(new Date(selectedYear, selectedMonth - 1, getDaysInMonth(new Date(selectedYear, selectedMonth - 1))), 'yyyy-MM-dd');
        setStartDate(firstDayOfMonth);
        setEndDate(lastDayOfMonth);
    }, [selectedYear, selectedMonth]);

    const { dailySales, salesSummary, loading, error } = useSalesData(startDate, endDate);

    const salesColumns = useMemo(() => [
        { header: '날짜', key: 'date', sortable: true, render: (item) => item.date },
        { header: '주문 건수', key: 'orderCount', sortable: true, render: (item) => item.orderCount },
        { header: '총 금액', key: 'totalAmount', sortable: true, render: (item) => `${item.totalAmount.toLocaleString()}원` },
        { header: '총 수수료', key: 'totalCommission', sortable: true, render: (item) => `${item.totalCommission.toLocaleString()}원` },
    ], []);

    const chartData = useMemo(() => ({
        labels: dailySales.map(data => data.date),
        datasets: [
            {
                label: '주문 건수',
                data: dailySales.map(data => data.orderCount),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
                yAxisID: 'y-orderCount',
            },
            {
                label: '총 금액',
                data: dailySales.map(data => data.totalAmount),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                tension: 0.1,
                yAxisID: 'y-amount',
            },
            {
                label: '총 수수료',
                data: dailySales.map(data => data.totalCommission),
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.1,
                yAxisID: 'y-amount',
            },
        ],
    }), [dailySales]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${selectedYear}년 ${selectedMonth}월 일별 매출 데이터`,
            },
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: '날짜',
                },
            },
            'y-orderCount': {
                type: 'linear',
                display: true,
                position: 'left',
                min: 0,
                title: {
                    display: true,
                    text: '주문 건수',
                },
            },
            'y-amount': {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                title: {
                    display: true,
                    text: '금액 / 수수료',
                },
                grid: {
                    drawOnChartArea: false, // Only draw grid lines for the first y-axis
                },
            },
        },
    }), [selectedYear, selectedMonth]);

    if (loading) return <div className="admin-container">데이터 로딩 중...</div>;
    if (error) return <div className="admin-container">오류 발생: {error.message}</div>;

    const years = Array.from({ length: 6 }, (_, i) => currentYear - i).reverse(); // Current year and 5 years prior
    const months = Array.from({ length: (selectedYear === currentYear ? currentMonth : 12) }, (_, i) => i + 1);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>매출 상세 보기</h2>
            </div>

            {salesSummary && (
                <SalesSummaryCards salesSummary={salesSummary} loading={loading} error={error} />
            )}

            <div className="date-selection" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="year-select" style={{ fontWeight: 'bold', color: 'var(--admin-pink-strong)' }}>년도:</label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ padding: '8px 12px', border: '1px solid var(--admin-pink-panel-border)', borderRadius: '8px', fontSize: '14px', color: 'var(--admin-pink-text)', backgroundColor: 'var(--admin-pink-bg)' }}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}년</option>
                    ))}
                </select>

                <label htmlFor="month-select" style={{ fontWeight: 'bold', color: 'var(--admin-pink-strong)' }}>월:</label>
                <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    style={{ padding: '8px 12px', border: '1px solid var(--admin-pink-panel-border)', borderRadius: '8px', fontSize: '14px', color: 'var(--admin-pink-text)', backgroundColor: 'var(--admin-pink-bg)' }}
                >
                    {months.map(month => (
                        <option key={month} value={month}>{month}월</option>
                    ))}
                </select>
            </div>

            <div className="chart-container">
                <Line options={chartOptions} data={chartData} />
            </div>

            <div className="admin-table-section">
                <h3>일별 매출 상세</h3>
                <AdminTable
                    data={dailySales.filter(item => item.orderCount > 0)}
                    columns={salesColumns}
                    sortConfig={{ key: 'date', direction: 'asc' }} // Default sort
                    onSort={() => {}} // Sorting will be handled by backend if implemented
                    emptyMessage="등록된 매출 데이터가 없습니다."
                />
            </div>
        </div>
    );
};

export default SalesDetailComponent;
