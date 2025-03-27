import axios from "axios";

const instance = axios.create({
  baseURL: "https://booking-app-api-production-8253.up.railway.app/api",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set with token');
  } else {
    console.warn('No token found in localStorage');
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("token");
    //   window.location.href = "/login";
    // }

    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default instance;