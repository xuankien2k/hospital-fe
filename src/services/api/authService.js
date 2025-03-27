import axiosInstance from './axios';

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/login', { email, password });

    // Lưu token vào localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
