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

  isMember: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'Member';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  // New utility functions for error handling
  handleAuthError: (error) => {
    if (error.response?.status === 401) {
      // Clear invalid authentication data
      authService.logout();
      // Redirect to login
      window.location.href = '/login';
      return 'Your session has expired. Please log in again.';
    } else if (error.response?.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    } else if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    } else {
      return error.response?.data?.message || 'An unexpected error occurred.';
    }
  },

  validateToken: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    try {
      // Basic token validation - check if it exists and user data is present
      const userData = JSON.parse(user);
      return !!(userData.token && userData.role);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  requireRole: (requiredRole) => {
    const userRole = localStorage.getItem('role');
    if (!userRole) {
      throw new Error('You must be logged in to access this feature.');
    }
    
    if (userRole !== requiredRole) {
      throw new Error(`This feature requires ${requiredRole} role. Your current role is ${userRole}.`);
    }
    
    return true;
  }
};

export default authService; 