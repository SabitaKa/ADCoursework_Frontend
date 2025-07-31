import axios from 'axios';

const API_URL = 'https://localhost:7098/api';

const emailService = {
  // Send order confirmation email
  sendOrderConfirmation: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/email/send-order-confirmation`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send order confirmation email' };
    }
  },

  // Send order processing notification
  sendOrderProcessingNotification: async (orderId, userId, claimCode, userEmail, userFullName) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending email notification with data:', { orderId, userId, claimCode, userEmail, userFullName }); // Debug log
      
      const response = await axios.post(
        `${API_URL}/email/send-processing-notification`,
        {
          orderId,
          userId,
          claimCode,
          userEmail,
          userFullName
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Email service response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Email service error:', error.response?.data || error); // Debug log
      throw error.response?.data || { message: 'Failed to send processing notification' };
    }
  },

  // Resend order confirmation email
  resendOrderConfirmation: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/email/resend-confirmation/${orderId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend confirmation email' };
    }
  }
};

export default emailService; 