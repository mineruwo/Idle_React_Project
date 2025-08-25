import { useState, useEffect } from 'react';

const useAdminAccountsData = (fetchApiFunction, pageSize) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [dateRange, setDateRange] = useState('1day');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetchApiFunction(pageSize, page, dateRange);
                setData(response.content);
                setTotalPages(response.totalPages);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("데이터를 불러오는데 실패했습니다."); // Generic error message
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [page, dateRange, fetchApiFunction, pageSize]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleDateRangeChange = (range) => {
        setDateRange(range);
        setPage(0); // Reset page when date range changes
    };

    return {
        data,
        loading,
        error,
        page,
        totalPages,
        dateRange,
        handlePageChange,
        handleDateRangeChange,
    };
};

export default useAdminAccountsData;
