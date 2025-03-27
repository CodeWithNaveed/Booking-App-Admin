import { useEffect, useState } from "react";
import api from "../api";

const useFetch = (endpoint, requireAuth = true) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await api.get(endpoint);
                setData(res.data);
            } catch (err) {
                setError({
                    message: err.response?.data?.message || err.message,
                    status: err.response?.status
                });

                if (err.response?.status === 401 && requireAuth) {
                    console.log('Unauthorized - redirect handled by interceptor');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint, requireAuth]);

    return { data, loading, error };
};

export default useFetch;