import { useEffect, useState } from "react";
import api from "../api";

const useFetch = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await api.get(endpoint);
                console.log('API Response:', res.data);
                setData(res.data);
            } catch (err) {
                console.error('API Error:', err);
                setError({
                    message: err.message || "Failed to fetch data",
                    status: err.status
                });

                // Special handling for 401
                if (err.status === 401) {
                    console.log('Redirecting handled by interceptor');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]);

    const reFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, reFetch };
};

export default useFetch;