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

  // Fetch cart from API on initial render - only for non-staff users
  useEffect(() => {
    if (userRole !== 'Staff') {
      fetchCart();
    } else {
      // For staff users, just set loading to false without fetching
      setIsLoading(false);
    }
  }, [userRole]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('role');
      
      if (!token) {
        setCartItems([]);
        setItemCount(0);
        return;
      }

      // Don't fetch cart for staff users
      if (userRole === 'Staff') {
        setCartItems([]);
        setItemCount(0);
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
      setError(error.message || 'Failed to fetch cart');
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

      if (userRole === 'Staff') {
        throw new Error('Staff members cannot add items to cart');
      }

      const response = await axios.post(
        'https://localhost:7098/api/cart/add',
        {
          bookId: item.id,
          quantity: item.quantity || 1
        },
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

      if (userRole === 'Staff') {
        throw new Error('Staff members cannot remove items from cart');
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

      if (userRole === 'Staff') {
        throw new Error('Staff members cannot update cart');
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

      if (userRole === 'Staff') {
        throw new Error('Staff members cannot clear cart');
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