import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your wishlist');
          return;
        }

        const response = await axios.get('https://localhost:7098/api/whitelist', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setWishlistItems(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch wishlist items');
        }
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        setError('Failed to load wishlist items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowNotification('Please login to manage your wishlist');
        return;
      }

      await axios.delete(`https://localhost:7098/api/whitelist/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setWishlistItems((prevItems) => prevItems.filter(item => item.id !== id));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      setShowNotification('Failed to remove item from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C81]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-gray-500">Start adding books you love!</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={`https://localhost:7098${item.bookImageURL}`}
                      alt={item.bookTitle}
                      className="w-full h-64 object-contain bg-gray-100"
                    />
                    <div
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow cursor-pointer"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.bookTitle}</h3>
                    <p className="text-sm text-gray-600 mb-1">by {item.authorName}</p>
                    <p className="text-sm text-gray-500 mb-3">Added on {new Date(item.addedOn).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/bookdetails/${item.bookId}`}
                        className="flex-1 bg-[#0F4C81] text-white px-4 py-2 rounded-md hover:bg-[#0d3e6a] transition-colors duration-300"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Notification */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 px-4 py-2 rounded-md bg-green-500 text-white shadow-lg">
            Removed from wishlist!
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;