import { useState, useEffect, useCallback } from 'react';

const usePaginatedData = (fetchApiFunction, initialParams = {}) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(initialParams.page || 0);
    const [size, setSize] = useState(initialParams.size || 10);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState(initialParams.filters || {});
    const [sortConfig, setSortConfig] = useState(initialParams.sortConfig || { key: 'id', direction: 'asc' });
    const [search, setSearch] = useState(initialParams.search || { query: '', type: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                size,
                ...filters,
                sort: `${sortConfig.key},${sortConfig.direction}`,
            };

            if (search.query && search.type) {
                params.searchType = search.type;
                params.searchQuery = search.query;
            }

            const response = await fetchApiFunction(params);
            setData(response.content);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [page, size, filters, sortConfig, search, fetchApiFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(0); // Reset to first page on filter change
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (newSearch) => {
        setSearch(newSearch);
        setPage(0); // Reset to first page on new search
    };

    return {
        data,
        loading,
        error,
        page,
        size,
        totalPages,
        filters,
        sortConfig,
        search,
        handlePageChange,
        handleFilterChange,
        handleSort,
        handleSearch,
        fetchData, // Expose fetchData for manual refresh if needed
    };
};

export default usePaginatedData;
