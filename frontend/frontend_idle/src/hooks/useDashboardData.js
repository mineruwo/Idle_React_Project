import { useState, useEffect } from 'react';

const useDashboardData = (fetchApiFunction, limit = null) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetchApiFunction();
                setData(Array.isArray(response) ? (limit ? response.slice(0, limit) : response) : []);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchApiFunction, limit]);

    return { data, loading, error };
};

export default useDashboardData;
