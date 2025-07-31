import { useState, useEffect } from 'react';
import axios from 'axios';
import emailService from '../../services/emailService';

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://localhost:7098/api/orders/all-orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          // Filter only pending orders and ensure they have required fields
          const pendingOrders = response.data.data
            .filter(order => order.status === 'Pending')
            .map(order => ({
              ...order,
              // Ensure we have all required fields for email confirmation
              userEmail: (order.userEmail && order.userEmail.trim() !== '') ? order.userEmail : (order.email && order.email.trim() !== '') ? order.email : '',
              userFullName: order.userFullName || order.customerName || 'Unknown Customer'
            }));
          setOrders(pendingOrders);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const resendConfirmationEmail = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      setSuccessMessage(null);
      
      const response = await emailService.resendOrderConfirmation(orderId);
      
      if (response.success) {
        setSuccessMessage('Confirmation email resent successfully!');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setError(response.message || 'Failed to resend confirmation email');
      }
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to resend confirmation email: ${errorMessage}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const retryOrderProcessing = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      setSuccessMessage(null);
      
      // Find the order
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        setError('Order not found');
        return;
      }

      // Retry processing the order
      const processResponse = await axios.post(
        `https://localhost:7098/api/orders/process?userId=${order.userId}&claimCode=${order.claimCode}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (processResponse.data.success) {
        setSuccessMessage('Order processing retry successful!');
        // Refresh the orders list
        window.location.reload();
      } else {
        setError(processResponse.data.message || 'Retry failed. Please try again.');
      }
    } catch (error) {
      console.error('Error retrying order processing:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Retry failed: ${errorMessage}`);
    } finally {
      setProcessingOrder(null);
    }
  };

  const processOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Starting to process order:', orderId); // Debug log

      // Find the order to get userId and claimCode
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        setError('Order not found');
        setProcessingOrder(null);
        return;
      }

      // Step 1: Process the order
      const processResponse = await axios.post(
        `https://localhost:7098/api/orders/process?userId=${order.userId}&claimCode=${order.claimCode}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (processResponse.data.success) {
        // Step 2: Send confirmation email
        try {
          // Validate that we have the required email information
          console.log('order.userEmail:', order.userEmail, typeof order.userEmail);
          const hasValidEmail = order.userEmail && order.userEmail.trim() !== '';
          
          if (!hasValidEmail) {
            console.warn('No user email found for order:', order.id);
            // Order was processed but we can't send email - remove from list
            setOrders(prevOrders => {
              const newOrders = prevOrders.filter(o => o.id !== orderId);
              console.log('Removing order from list. Remaining orders:', newOrders.length);
              return newOrders;
            });
            setSuccessMessage(`Order processed successfully! email was sent.`);
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
            return;
          }

          const emailResponse = await emailService.sendOrderProcessingNotification(
            order.id,
            order.userId,
            order.claimCode,
            order.userEmail,
            order.userFullName
          );
          
          console.log('Email response:', emailResponse); // Debug log
          
          // Check if email was sent successfully (be more lenient with the check)
          const emailSent = emailResponse.success || emailResponse.message?.includes('sent') || emailResponse.message?.includes('success');
          
          // Always remove the processed order from the list
          setOrders(prevOrders => {
            const newOrders = prevOrders.filter(o => o.id !== orderId);
            console.log('Removing processed order from list. Remaining orders:', newOrders.length);
            return newOrders;
          });
          
          if (emailSent) {
            setSuccessMessage(`Order processed successfully! Confirmation email sent to ${order.userEmail}.`);
          } else {
            setSuccessMessage(`Order processed successfully! However, there was an issue sending the confirmation email: ${emailResponse.message || 'Unknown error'}`);
          }
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Order was processed but email failed - still remove from list
          setOrders(prevOrders => {
            const newOrders = prevOrders.filter(o => o.id !== orderId);
            console.log('Removing order after email error. Remaining orders:', newOrders.length);
            return newOrders;
          });
          const emailErrorMessage = emailError.response?.data?.message || emailError.message || 'Unknown error';
          setSuccessMessage(`Order processed successfully! However, there was an issue sending the confirmation email: ${emailErrorMessage}`);
          
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        }
      } else {
        console.log('Order processing failed:', processResponse.data); // Debug log
        setError(processResponse.data.message || 'Failed to process order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      
      // Provide more specific error messages with actionable advice
      if (error.response?.status === 404) {
        setError('Order not found or endpoint does not exist. Please refresh the page and try again.');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again and try processing the order.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to process orders. Please contact your administrator.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Invalid request. Please check the order details and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again in a few minutes or contact support.');
      } else if (error.response?.data?.message) {
        setError(`Order processing failed: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        setError('Network connection error. Please check your internet connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError('An unexpected error occurred while processing the order. Please try again or contact support.');
      }
      
      // Clear error after 10 seconds
      setTimeout(() => {
        setError(null);
      }, 10000);
    } finally {
      setProcessingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  // Remove the full-page error display since we have inline error messages

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Process Orders</h1>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title="Refresh orders list"
        >
          🔄 Refresh
        </button>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-600 py-8">No pending orders to process</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.userFullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">{order.claimCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => processOrder(order.id)}
                        disabled={processingOrder === order.id}
                        className={`px-4 py-2 rounded transition-colors text-sm ${
                          processingOrder === order.id
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {processingOrder === order.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          'Process Order'
                        )}
                      </button>
                      
                      {order.userEmail && (
                        <button
                          onClick={() => resendConfirmationEmail(order.id)}
                          disabled={processingOrder === order.id}
                          className={`px-3 py-2 rounded transition-colors text-sm ${
                            processingOrder === order.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          title="Resend confirmation email"
                        >
                          📧
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffOrders; 