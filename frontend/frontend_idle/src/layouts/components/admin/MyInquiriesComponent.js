import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
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
import { adminApi } from '../../../api/adminApi';
import AdminChartCard from '../common/AdminChartCard'; // Import AdminChartCard
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch daily answer data for the graph
    const fetchDailyAnswerData = async (year, month) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminApi.get(`/admin/inquiries/daily-answers`, { params: { year, month } });
            const backendData = response.data;

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

            const maxCount = Math.max(...counts, 10);

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
                yAxisMax: maxCount
            });
        } catch (err) {
            setError(err);
            console.error('Error fetching daily answer data:', err);
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
                        data: allDates.map(() => 0),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                    },
                ],
                yAxisMax: 10
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch inquiry table data based on filter
    const fetchInquiryTableData = async (filter) => {
        try {
            const response = await adminApi.get(`/admin/inquiries/my-history`, { params: { filter } });
            setInquiryTableData(response.data);
        } catch (error) {
            console.error('Error fetching inquiry table data:', error);
            setInquiryTableData([]);
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
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
                max: dailyAnswerData.yAxisMax,
            },
        },
    };

    const years = Array.from({ length: 6 }, (_, i) => currentYear - i).reverse();
    const months = Array.from({ length: (selectedYear === currentYear ? currentMonth : 12) }, (_, i) => i + 1);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>내 상담 내역 확인</h2>
            </div>

            <AdminChartCard
                title="일일 답변 추이"
                chartData={dailyAnswerData}
                chartOptions={chartOptions}
                loading={loading}
                error={error}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                setSelectedYear={setSelectedYear}
                setSelectedMonth={setSelectedMonth}
                years={years}
                months={months}
            />

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
