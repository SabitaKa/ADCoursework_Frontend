import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);
  
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getCartCount,
    isLoading,
    refreshCart
  } = useCart();

  const handleRemoveItem = async (bookId) => {
    try {
      setIsRemoving(bookId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to remove items from cart');
      }

      await axios.delete('https://localhost:7098/api/cart/remove', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: {
          bookId: bookId
        }
      });
      await refreshCart();
      setSuccessMessage('Book has been removed from your cart successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setIsClearing(true);
      await clearCart();
      setSuccessMessage('Your cart has been cleared successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    // Add any checkout logic here
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Loading your cart...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-12 px-4">
         <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any books to your cart yet.</p>
          <Link
            to="/BookCatalog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Continue Shopping
          </Link>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash className="mr-1" /> {isClearing ? 'Clearing...' : 'Clear Cart'}
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Book Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.img ? `https://localhost:7098${item.img}` : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxIDVIM2ExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMThhMSAxIDAgMDAxLTFWNmExIDEgMCAwMC0xLTF6bS0xIDJ2Mkg0VjdoMTZ6bTAgNHY4SDR2LThoMTZ6IiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+'}
                        alt={item.title}
                        className="w-20 h-28 sm:w-24 sm:h-32 object-contain bg-gray-100 rounded-md border"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxIDVIM2ExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMThhMSAxIDAgMDAxLTFWNmExIDEgMCAwMC0xLTF6bS0xIDJ2Mkg0VjdoMTZ6bTAgNHY4SDR2LThoMTZ6IiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+';
                        }}
                      />
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-left font-semibold text-gray-800 mb-1">{item.title}</h3>
                     
                      
                      {/* Quantity and Price Controls */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x min-w-[3rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-lg text-gray-800">
                            ${item.price ? (item.price * item.quantity).toFixed(2) : 'N/A'}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving === item.id}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove from cart"
                          >
                            {isRemoving === item.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Link to="/BookCatalog" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                <FaArrowLeft className="mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({getCartCount()})</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
             
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg text-blue-600 font-bold">${getTotalPrice().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center font-medium transition-colors"
              >
                <FaCreditCard className="mr-2" /> Proceed to Checkout
              </button>

           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;