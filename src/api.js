import axios from "axios";

const instance = axios.create({
  baseURL: "https://booking-app-api-production-8253.up.railway.app/api",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    config.headers.Authorization  = userData._id;
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