import axios from 'axios';

const API_URL = 'https://localhost:7098/api/auth';

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  },

  getCurrentUser: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  },

  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'Admin';
  },

  isStaff: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'Staff';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};

export default authService; 