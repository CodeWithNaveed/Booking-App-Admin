import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // const token = localStorage.getItem("token");
                // console.log("Stored Token Before Request:", token); 

                console.log("API Request URL:", url);
                const res = await axios.get(url);

                console.log("API Response Data:", res.data);
                setData(res.data);
            } catch (err) {
                setError(err);
            }
            setLoading(false);
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

export default useFetch;
