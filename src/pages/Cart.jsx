// import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCreditCard } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
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
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // You might want to show an error message to the user here
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FaTrash className="mr-1" /> Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="flex-1">
                      <h3 className="text-left font-semibold text-gray-800">{item.title}</h3>
                      <div className="text-gray-600 mb-2">
                        Unit Price: ${item.price ? item.price.toFixed(2) : 'N/A'}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
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
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaTrash />
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg text-blue-600 font-bold">${getTotalPrice().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center font-medium"
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