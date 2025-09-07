
import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { getAllInquiries, getDailyInquiryCounts } from '../../../api/adminApi';
import AdminSelect from '../common/AdminSelect'; // Import AdminSelect
import AdminChartCard from '../common/AdminChartCard'; // Import AdminChartCard
import '../../../theme/admin.css';

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

                const dataMap = new Map((Array.isArray(backendData) ? backendData : []).map(item => [item.date, item.count]));
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

    const years = Array.from({ length: 6 }, (_, i) => currentYear - i).reverse(); // Current year and 5 years prior
    const months = Array.from({ length: (selectedYear === currentYear ? currentMonth : 12) }, (_, i) => i + 1);

    return (
        <div>
            <AdminChartCard
                title="일일 문의 추이"
                chartData={dailyInquiryData}
                chartOptions={chartOptions}
                loading={false} // Adjust based on actual loading state if available
                error={null} // Adjust based on actual error state if available
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                setSelectedYear={setSelectedYear}
                setSelectedMonth={setSelectedMonth}
                years={years}
                months={months}
            />

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
