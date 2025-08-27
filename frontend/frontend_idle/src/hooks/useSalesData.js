import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseISO, addDays, format } from 'date-fns';

const useSalesData = (startDate, endDate) => {
    const [dailySales, setDailySales] = useState([]);
    const [salesSummary, setSalesSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalesSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                const summaryResponse = await axios.get(`/api/admin/sales/summary`);
                setSalesSummary(summaryResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchDailySales = async () => {
            setLoading(true);
            setError(null);
            try {
                const dailyResponse = await axios.get(`/api/admin/sales/daily`, {
                    params: { startDate, endDate }
                });

                const fetchedDailySales = dailyResponse.data;
                const allDates = [];
                let currentDate = parseISO(startDate);
                const end = parseISO(endDate);

                while (currentDate <= end) {
                    allDates.push(format(currentDate, 'yyyy-MM-dd'));
                    currentDate = addDays(currentDate, 1);
                }

                const salesMap = new Map(fetchedDailySales.map(item => [item.date, item]));

                const fullDailySales = allDates.map(date => {
                    const data = salesMap.get(date);
                    return {
                        date: date,
                        orderCount: data ? data.orderCount : 0,
                        totalAmount: data ? data.totalAmount : 0,
                        totalCommission: data ? data.totalCommission : 0,
                    };
                });

                setDailySales(fullDailySales);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesSummary(); // Always fetch summary

        if (startDate && endDate) {
            fetchDailySales(); // Only fetch daily if dates are provided
        } else {
            setDailySales([]); // Clear daily sales if dates are not provided
        }
    }, [startDate, endDate]);

    return { dailySales, salesSummary, loading, error };
};

export default useSalesData;
