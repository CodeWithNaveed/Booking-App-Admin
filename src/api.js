import axios from "axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const instance = axios.create({
  // baseURL: "http://localhost:4400/api",
  baseURL: "https://booking-app-api-production-8253.up.railway.app/api",
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  if (!config.url.includes('cloudinary.com')) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage');
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh
        const refreshToken = getCookie('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${instance.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );

          const newToken = refreshResponse.data.accessToken;
          localStorage.setItem("token", newToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // Clear auth data and redirect if refresh fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // window.location.href = "/login";
      console.log(error);
    }

    return Promise.reject(error);
  }
);

export default instance;