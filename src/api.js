import axios from "axios";

const instance = axios.create({
  baseURL: "https://booking-app-api-production-8253.up.railway.app/api",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
    return Promise.reject(error);
  }
);

export default instance;