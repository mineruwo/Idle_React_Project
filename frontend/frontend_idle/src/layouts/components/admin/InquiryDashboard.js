
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
import { getAllInquiries, getDailyInquiryCounts } from '../../../api/adminApi';
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

const InquiryDashboard = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [dailyInquiryData, setDailyInquiryData] = useState({ labels: [], datasets: [], yAxisMax: 10 });
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await getDailyInquiryCounts(selectedYear, selectedMonth);
                const backendData = response; // No .data if axios instance handles it

                const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                const allDates = Array.from({ length: daysInMonth }, (_, i) => `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);

                const dataMap = new Map(backendData.map(item => [item.date, item.count]));
                const counts = allDates.map(date => dataMap.get(date) || 0);

                const maxCount = Math.max(...counts, 10); // Calculate max, ensure at least 10

                setDailyInquiryData({
                    labels: allDates,
                    datasets: [
                        {
                            label: '일일 문의 수',
                            data: counts,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            tension: 0.1,
                        },
                    ],
                    yAxisMax: maxCount // Store max for dynamic options
                });
            } catch (error) {
                console.error('Error fetching daily inquiry data:', error);
            }
        };

        fetchGraphData();
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        const fetchRecentInquiries = async () => {
            try {
                const response = await getAllInquiries({ page: 0, size: 5, sort: 'createdAt,desc' });
                setRecentInquiries(response.content || []);
            } catch (error) {
                console.error('Error fetching recent inquiries:', error);
            }
        };

        fetchRecentInquiries();
    }, []);

    const inquiryColumns = [
        { header: '상담 번호', key: 'inquiryId', sortable: true },
        { header: '제목', key: 'inquiryTitle', sortable: true },
        { header: '상태', key: 'status', sortable: true },
        { header: '생성일', key: 'createdAt', sortable: true, render: (item) => new Date(item.createdAt).toLocaleDateString() },
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: '월별 일일 문의 추이' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 },
                max: dailyInquiryData.yAxisMax, // Set dynamic max
            },
        },
    };

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div>
            <div className="graph-section admin-card" style={{ marginBottom: '24px' }}>
                <h3>일일 문의 추이</h3>
                <div className="date-selector">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => <option key={year} value={year}>{year}년</option>)}
                    </select>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                        {months.map(month => <option key={month} value={month}>{month}월</option>)}
                    </select>
                </div>
                <div className="chart-container">
                    {dailyInquiryData.labels.length > 0 ? (
                        <Line data={dailyInquiryData} options={chartOptions} />
                    ) : (
                        <p>데이터를 불러오는 중...</p>
                    )}
                </div>
            </div>

            <div className="table-section admin-card">
                <h3>최근 문의 5건</h3>
                <AdminTable
                    data={recentInquiries}
                    columns={inquiryColumns}
                    sortConfig={{ key: 'createdAt', direction: 'desc' }}
                    onSort={() => {}}
                    emptyMessage="최근 문의 내역이 없습니다."
                />
            </div>
        </div>
    );
};

export default InquiryDashboard;
