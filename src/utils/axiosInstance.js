import axios from 'axios';
import { getAuthToken } from './authStorage';
import { getApiErrorMessage } from './apiError';

const PRODUCTION_API_URL = 'https://bacninh-hospital.com';
const LOCAL_API_URL = 'http://localhost:3005';

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_API_URL;
    }
  }

  return process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;
}

const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
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
    const apiMessage = getApiErrorMessage(error, '');
    if (apiMessage) {
      error.message = apiMessage;
      error.apiMessage = apiMessage;
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
