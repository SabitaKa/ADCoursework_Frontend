import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [userRole, setUserRole] = useState(null);

  // Check user role on mount
  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  // Fetch cart from API on initial render - only for Member users
  useEffect(() => {
    if (userRole === 'Member') {
      fetchCart();
    } else {
      // For non-Member users (Admin, Staff), just set loading to false without fetching
      setIsLoading(false);
      if (userRole === 'Admin' || userRole === 'Staff') {
        setError('Cart functionality is not available for Admin and Staff users.');
      }
    }
  }, [userRole]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        setCartItems([]);
        setItemCount(0);
        setError('You must be logged in to view your cart.');
        return;
      }

      // Only fetch cart for Member users
      if (userRole !== 'Member') {
        setCartItems([]);
        setItemCount(0);
        setError('Cart functionality is not available for Admin and Staff users.');
        return;
      }

      const response = await axios.get('https://localhost:7098/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const mappedItems = (response.data.data.items || []).map(item => ({
          id: item.bookId,
          title: item.bookTitle,
          img: item.bookCoverImageUrl,
          price: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          discountPercentage: item.discountPercentage || 0,
          originalPrice: item.originalPrice || item.unitPrice
        }));
        setCartItems(mappedItems);
        setItemCount(response.data.data.itemCount || 0);
      } else {
        setError(response.data.message || 'Failed to fetch cart');
        setItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        setError('Access denied. Cart functionality is only available for Member users.');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Clear invalid authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch cart. Please try again later.');
      }
      setItemCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        throw new Error('You must be logged in to add items to cart');
      }

      if (userRole !== 'Member') {
        throw new Error('Cart functionality is only available for Member users');
      }

      const requestData = {
        bookId: item.id,
        quantity: item.quantity || 1
      };
      
      console.log('Adding to cart with data:', requestData); // Debug log
      
      const response = await axios.post(
        'https://localhost:7098/api/cart/add',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Refresh cart after adding item
        await fetchCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data); // Debug log
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('Access denied. Cart functionality is only available for Member users.');
      } else if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.response?.status === 400) {
        // Show the actual validation error from the backend
        const errorMessage = error.response?.data?.message || 'Invalid request data';
        throw new Error(errorMessage);
      }
      throw error;
    }
  };

  const removeFromCart = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        throw new Error('You must be logged in to remove items from cart');
      }

      if (userRole !== 'Member') {
        throw new Error('Cart functionality is only available for Member users');
      }

      const response = await axios.delete('https://localhost:7098/api/cart/remove', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          bookId: id
        }
      });

      if (response.data.success) {
        await fetchCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('Access denied. Cart functionality is only available for Member users.');
      } else if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      throw error;
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        throw new Error('You must be logged in to update cart');
      }

      if (userRole !== 'Member') {
        throw new Error('Cart functionality is only available for Member users');
      }

      const response = await axios.put(
        'https://localhost:7098/api/cart/update',
        { 
          bookId: id,
          quantity: quantity 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await fetchCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('Access denied. Cart functionality is only available for Member users.');
      } else if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        throw new Error('You must be logged in to clear cart');
      }

      if (userRole !== 'Member') {
        throw new Error('Cart functionality is only available for Member users');
      }

      const response = await axios.delete('https://localhost:7098/api/cart/clear', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchCart();
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('Access denied. Cart functionality is only available for Member users.');
      } else if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      throw error;
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const discountedPrice = item.discountPercentage 
        ? item.originalPrice * (1 - item.discountPercentage / 100)
        : item.price;
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isStaffUser = () => {
    return userRole === 'Staff';
  };

  const isMemberUser = () => {
    return userRole === 'Member';
  };

  const isAdminUser = () => {
    return userRole === 'Admin';
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getCartCount,
        isLoading,
        error,
        refreshCart: fetchCart,
        itemCount,
        isStaffUser,
        isMemberUser,
        isAdminUser,
        userRole,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};