// hooks/useFetch.js
import { useEffect, useState } from "react";
import api from "../api"; // Import your instance

const useFetch = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get(endpoint); // Use your instance
                setData(res.data);
            } catch (err) {
                setError(err);
            }
            setLoading(false);
        };

        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

export default useFetch;