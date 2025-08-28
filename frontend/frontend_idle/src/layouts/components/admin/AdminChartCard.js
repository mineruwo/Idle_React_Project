import React from 'react';
import { Line } from 'react-chartjs-2';
import '../../../theme/admin.css';
import AdminSelect from '../common/AdminSelect'; // Assuming AdminSelect is in common

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
        <div className="admin-form-container" style={{ marginBottom: '24px' }}>
            <h3 className="admin-chart-title">{title}</h3>
            <div className="chart-date-selection">
                <label htmlFor="year-select" className="admin-label">년도:</label>
                <AdminSelect
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    options={years.map(year => ({ value: year, label: `${year}년` }))}
                />

                <label htmlFor="month-select" className="admin-label">월:</label>
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
        </div>
    );
};

export default AdminChartCard;