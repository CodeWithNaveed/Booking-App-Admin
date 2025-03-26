import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        console.log("useFetch hook mounted with URL:", url); // Add this line
        
        const fetchData = async () => {
            setLoading(true);
            try {
                console.log("API Request URL:", url);
                const res = await axios.get(url);
                console.log("API Response:", res.data); // Add this line
                setData(res.data);
            } catch (err) {
                console.error("API Error:", err); // Add this line
                setError(err);
            }
            setLoading(false);
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

export default useFetch;