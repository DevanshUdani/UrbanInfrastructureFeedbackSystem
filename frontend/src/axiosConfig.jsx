import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api'),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 10000, // 10 second timeout
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("[API network error]", {
        message: error.message,
        code: error.code,
        url: error.config && error.config.url,
        baseURL: error.config && error.config.baseURL,
      });
    } else if (error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response.status === 429) {
      // Handle rate limiting
      console.error('Rate limit exceeded. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
