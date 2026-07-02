import axios from 'axios';
import { getAuthToken } from './authStorage';

// Dev: localhost. Production: cùng domain (Nginx proxy /api → backend)
const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? 'https://bacninh-hospital.com' : 'http://localhost:3005';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Thêm interceptor để xử lý lỗi hoặc thêm token (nếu có)
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
