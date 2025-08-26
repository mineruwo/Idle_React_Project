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
    });
    const [inquiryTableData, setInquiryTableData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedFilter, setSelectedFilter] = useState('all'); // 'day', 'week', 'month', 'year', 'all'

    // Function to fetch daily answer data for the graph
    const fetchDailyAnswerData = async (year, month) => {
        try {
            const response = await axios.get(`/api/admin/inquiries/daily-answers?year=${year}&month=${month}`);
            const data = response.data;

            const labels = data.map(item => item.date);
            const counts = data.map(item => item.count);

            setDailyAnswerData({
                labels: labels,
                datasets: [
                    {
                        label: '일일 답변 수',
                        data: counts,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        tension: 0.1,
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching daily answer data:', error);
            setDailyAnswerData({ labels: [], datasets: [] }); // Clear data on error
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
        { header: '상담 번호', key: 'id', sortable: true, render: (item) => item.id },
        { header: '제목', key: 'title', sortable: true, render: (item) => item.title },
        { header: '상태', key: 'status', sortable: true, render: (item) => item.status },
        { header: '배정일', key: 'assignedDate', sortable: true, render: (item) => item.assignedDate },
        { header: '답변 내용', key: 'answerContent', sortable: false, render: (item) => item.answerContent || 'N/A' },
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
                        <Line data={dailyAnswerData} options={chartOptions} />
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
