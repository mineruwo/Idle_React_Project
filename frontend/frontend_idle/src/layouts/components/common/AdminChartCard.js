import React from 'react';
import { Line } from 'react-chartjs-2';
import AdminCard from './AdminCard';
import AdminSelect from './AdminSelect';
import '../../../theme/admin.css';

const AdminChartCard = ({
    title,
    chartData,
    chartOptions,
    loading,
    error,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    years,
    months,
}) => {
    return (
        <AdminCard title={title}>
            <div className="date-selection" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="year-select" style={{ fontWeight: 'bold', color: 'var(--admin-pink-strong)' }}>년도:</label>
                <AdminSelect
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    options={years.map(year => ({ value: year, label: `${year}년` }))}
                />

                <label htmlFor="month-select" style={{ fontWeight: 'bold', color: 'var(--admin-pink-strong)' }}>월:</label>
                <AdminSelect
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    options={months.map(month => ({ value: month, label: `${month}월` }))}
                />
            </div>
            {loading ? (
                <div>차트 로딩 중...</div>
            ) : error ? (
                <div className="error-message">{error.message}</div>
            ) : (
                <div className="chart-container">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}
        </AdminCard>
    );
};

export default AdminChartCard;
