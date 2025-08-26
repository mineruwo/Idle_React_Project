import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
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
import axios from 'axios';
import '../../../theme/admin.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MyInquiriesComponent = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

    const [dailyAnswerData, setDailyAnswerData] = useState({
        labels: [],
        datasets: [],
        yAxisMax: 10, // Initial max value
    });
    const [inquiryTableData, setInquiryTableData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'day', 'week', 'month', 'year', 'all'

    // Function to fetch daily answer data for the graph
    const fetchDailyAnswerData = async (year, month) => {
        try {
            const response = await axios.get(`/api/admin/inquiries/daily-answers?year=${year}&month=${month}`);
            const backendData = response.data; // Renamed to avoid conflict

            const daysInMonth = new Date(year, month, 0).getDate();
            const allDates = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            });

            const dataMap = new Map();
            backendData.forEach(item => {
                dataMap.set(item.date, item.count);
            });

            const counts = allDates.map(date => dataMap.get(date) || 0);

            const maxCount = Math.max(...counts, 10); // Calculate max, ensure at least 10

            setDailyAnswerData({
                labels: allDates,
                datasets: [
                    {
                        label: '일일 답변 수',
                        data: counts,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                    },
                ],
                yAxisMax: maxCount // Store max for dynamic options
            });
        } catch (error) {
            console.error('Error fetching daily answer data:', error);
            // Even on error, try to render a zero-filled graph for the selected month
            const daysInMonth = new Date(year, month, 0).getDate();
            const allDates = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            });
            setDailyAnswerData({
                labels: allDates,
                datasets: [
                    {
                        label: '일일 답변 수',
                        data: allDates.map(() => 0), // All zeros on error
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                    },
                ],
                yAxisMax: 10 // Default max on error
            });
        }
    };

    // Function to fetch inquiry table data based on filter
    const fetchInquiryTableData = async (filter) => {
        try {
            const response = await axios.get(`/api/admin/inquiries/my-history?filter=${filter}`);
            setInquiryTableData(response.data);
        } catch (error) {
            console.error('Error fetching inquiry table data:', error);
            setInquiryTableData([]); // Clear data on error
        }
    };

    // Effect for fetching daily answer data when year/month changes
    useEffect(() => {
        fetchDailyAnswerData(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    // Effect for fetching inquiry table data when filter changes
    useEffect(() => {
        fetchInquiryTableData(selectedFilter);
    }, [selectedFilter]);

    const myInquiriesColumns = [
        { header: '상담 번호', key: 'inquiryId', sortable: true, render: (item) => item.inquiryId },
        { header: '제목', key: 'inquiryTitle', sortable: true, render: (item) => item.inquiryTitle },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
        { header: '생성일', key: 'createdAt', sortable: true, render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A' },
        { header: '답변 내용', key: 'inquiryAnswer', sortable: false, render: (item) => item.inquiryAnswer || 'N/A' },
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '월별 일일 답변 추이',
            },
        },
        scales: { // Add this scales configuration
            y: {
                beginAtZero: true, // Ensure the Y-axis starts at 0
                ticks: {
                    precision: 0, // Ensure only integer ticks
                    callback: function(value) {
                        if (value % 1 === 0) { // Only show integer labels
                            return value;
                        }
                        return null; // Hide non-integer labels
                    }
                }
            }
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // Current year +/- 2
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>내 상담 내역 확인</h2>
            </div>

            {/* Graph Section */}
            <div className="graph-section admin-card">
                <h3>일일 답변 추이</h3>
                <div className="date-selector">
                    <label htmlFor="year-select">년도:</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year}년</option>
                        ))}
                    </select>
                    <label htmlFor="month-select">월:</label>
                    <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month}월</option>
                        ))}
                    </select>
                </div>
                <div className="chart-container">
                    {dailyAnswerData.labels.length > 0 ? (
                        <Line data={dailyAnswerData} options={{
                            ...chartOptions, // Spread existing options
                            scales: {
                                ...chartOptions.scales, // Spread existing scales
                                y: {
                                    ...chartOptions.scales.y, // Spread existing y-axis options
                                    max: dailyAnswerData.yAxisMax, // Set dynamic max
                                },
                            },
                        }} />
                    ) : (
                        <p>데이터를 불러오는 중이거나 표시할 데이터가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section admin-card">
                <h3>답변 내용 리스트</h3>
                <div className="filter-buttons">
                    {['all', 'day', 'week', 'month', 'year'].map((filter) => (
                        <button
                            key={filter}
                            className={`filter-button ${selectedFilter === filter ? 'active' : ''}`}
                            onClick={() => setSelectedFilter(filter)}
                        >
                            {filter === 'day' && '1일'}
                            {filter === 'week' && '1주'}
                            {filter === 'month' && '1달'}
                            {filter === 'year' && '1년'}
                            {filter === 'all' && '전체'}
                        </button>
                    ))}
                </div>
                <AdminTable
                    data={inquiryTableData}
                    columns={myInquiriesColumns}
                    sortConfig={{ key: 'id', direction: 'asc' }} // Default sort config
                    onSort={() => {}} // Placeholder for sorting logic
                    emptyMessage="조회된 상담 내역이 없습니다."
                />
            </div>
        </div>
    );
};

export default MyInquiriesComponent;
