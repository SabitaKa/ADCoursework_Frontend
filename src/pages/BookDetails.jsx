import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const BookDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState(null);
  const { addToCart } = useCart();
  
  // Review states
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        setError("No book ID found in URL");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`https://localhost:7098/api/books/${id}`, { headers });
        if (response.data.success) {
          console.log('Book data received:', response.data.data);
          console.log('Discount percentage:', response.data.data.discountPercentage);
          setBook(response.data.data);
          // Check if book is in wishlist
          checkWishlistStatus(response.data.data.id);
          // Check if user has already reviewed
          checkUserReview(response.data.data.id);
        } else {
          setError(response.data.message || 'Failed to fetch book details');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to connect to the server.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const checkWishlistStatus = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('https://localhost:7098/api/whitelist', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const isInWishlist = response.data.data.some(item => item.bookId === bookId);
        setIsWishlisted(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const checkUserReview = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await axios.get(`https://localhost:7098/api/reviews/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userReview = response.data.data.find(review => review.bookId === bookId);
        if (userReview) {
          setUserReview(userReview);
          setReviewForm({
            rating: userReview.rating,
            comment: userReview.comment
          });
        } else {
          setUserReview(null);
        }
      }
    } catch (error) {
      console.error('Error checking user review:', error);
      setUserReview(null);
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('You must be logged in to save books.', 'error');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        showNotification('User information not found. Please log in again.', 'error');
        return;
      }

      if (!isWishlisted) {
        await axios.post(
          'https://localhost:7098/api/whitelist',
          {
            userId: userId,
            bookId: book.id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsWishlisted(true);
        showNotification(`${book.title} added to your wishlist!`);
      } else {
        // If you have an endpoint to remove from wishlist, implement it here
        // For now, we'll just toggle the UI state
        setIsWishlisted(false);
        showNotification(`${book.title} removed from your wishlist!`);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.data?.message === "This book is already in your whitelist.") {
        showNotification('This book is already in your wishlist.', 'error');
        setIsWishlisted(true); // Update UI to reflect that the book is in wishlist
      } else if (error.response?.data?.message === "User not found.") {
        showNotification('User not found. Please log in again.', 'error');
      } else if (error.response?.data?.message === "Book not found.") {
        showNotification('Book not found.', 'error');
      } else {
        showNotification('Failed to update wishlist.', 'error');
      }
    }
  };

  const showNotification = (message, type = 'success') => {
    // You can implement a notification system here
    console.log(message);
  };

  const handleAddToCart = async () => {
    if (book.stockQuantity <= 0) {
      setCartError('This book is out of stock.');
      return;
    }
    
    if (!book.isAvailable) {
      setCartError('This book is not available for purchase.');
      return;
    }
    
    // Check if user is logged in and has Member role
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token) {
      setCartError('You must be logged in to add items to cart.');
      return;
    }
    
    if (userRole !== 'Member') {
      setCartError('Cart functionality is only available for Member users.');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      setCartError(null);
      
      // Validate book data before sending
      if (!book.id) {
        setCartError('Invalid book data. Please refresh the page and try again.');
        return;
      }
      
      console.log('Book data being sent to cart:', {
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: quantity
      });
      
      await addToCart({
        id: book.id,
        title: book.title,
        author: book.authorName,
        price: book.price,
        format: book.format || 'Paperback',
        img: book.coverImageUrl,
        quantity: quantity,
        discountPercentage: book.discountPercentage || 0,
        originalPrice: book.price
      });
      
      // Show success message
      showNotification(`${book.title} added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartError(error.message || 'Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const calculateDiscountedPrice = () => {
    if (!book.discountPercentage) return book.price;
    return book.price * (1 - book.discountPercentage / 100);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!book.isPurchasedByUser) {
      setReviewError('You must purchase this book before submitting a review.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setReviewError('You must be logged in to submit a review.');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        setReviewError('User information not found. Please log in again.');
        return;
      }

      const reviewData = {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userId: userId,
        bookId: book.id
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (userReview) {
        // Update existing review
        try {
          await axios.put(
            `https://localhost:7098/api/reviews/${userReview.id}`,
            reviewData,
            { headers }
          );
          showNotification('Review updated successfully!');
          setIsEditingReview(false); // Reset editing state after successful update
        } catch (updateError) {
          if (updateError.response?.status === 403) {
            setReviewError('You do not have permission to update this review. Please make sure you are logged in as a Member.');
            return;
          }
          throw updateError; // Re-throw other errors to be caught by outer catch
        }
      } else {
        // Create new review
        try {
          await axios.post(
            'https://localhost:7098/api/reviews/add',
            reviewData,
            { headers }
          );
          showNotification('Review submitted successfully!');
        } catch (createError) {
          if (createError.response?.status === 403) {
            setReviewError('You do not have permission to create a review. Please make sure you are logged in as a Member.');
            return;
          }
          throw createError; // Re-throw other errors to be caught by outer catch
        }
      }

      // Refresh book details to show updated reviews
      const bookResponse = await axios.get(`https://localhost:7098/api/books/${id}`, { headers });
      if (bookResponse.data.success) {
        setBook(bookResponse.data.data);
        checkUserReview(book.id);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 403) {
        setReviewError('You do not have permission to perform this action. Please make sure you are logged in as a Member.');
      } else if (error.response?.status === 401) {
        setReviewError('Your session has expired. Please log in again.');
      } else {
        setReviewError(error.response?.data?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setIsDeletingReview(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewError('You must be logged in to delete a review.');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(
        `https://localhost:7098/api/reviews/${reviewId}`,
        { headers }
      );

      showNotification('Review deleted successfully!');
      
      // Refresh book details to show updated reviews
      const bookResponse = await axios.get(`https://localhost:7098/api/books/${id}`, { headers });
      if (bookResponse.data.success) {
        setBook(bookResponse.data.data);
        setUserReview(null);
        setReviewForm({
          rating: 5,
          comment: '',
        });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error.response?.status === 403) {
        setReviewError('You do not have permission to delete this review. Please make sure you are logged in as a Member.');
      } else if (error.response?.status === 401) {
        setReviewError('Your session has expired. Please log in again.');
      } else {
        setReviewError(error.response?.data?.message || 'Failed to delete review. Please try again.');
      }
    } finally {
      setIsDeletingReview(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({
        id: book.id,
        title: book.title,
        author: book.authorName,
        price: book.price,
        format: book.format || 'Paperback',
        img: book.coverImageUrl,
        quantity: quantity,
        discountPercentage: book.discountPercentage || 0,
        originalPrice: book.price
      });
      navigate('/checkout');
    } catch (error) {
      showNotification('Failed to proceed to checkout. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Error: {error}</div>;
  }

  if (!book) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">No book found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Arrow */}
      <button
        onClick={() => navigate('/bookcatalog')}
        className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium mb-4 focus:outline-none"
        style={{ fontSize: '1.1rem' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Catalog
      </button>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row">
            {/* Book Cover Section */}
            <div className="lg:w-2/5 p-6 md:p-8 bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md">
                <img 
                  src={`https://localhost:7098${book.coverImageUrl}`} 
                  alt={book.title} 
                  className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxIDVIM2ExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMThhMSAxIDAgMDAxLTFWNmExIDEgMCAwMC0xLTF6bS0xIDJ2Mkg0VjdoMTZ6bTAgNHY4SDR2LThoMTZ6IiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+';
                  }}
                />
                <div className="absolute -top-3 -right-3">
                  <div 
                    className={`p-3 rounded-full shadow-md ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-white text-gray-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Special Badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {book.isAwardWinner && (
                    <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Award Winner
                    </div>
                  )}
                  {book.isComingSoon && (
                    <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Coming Soon
                    </div>
                  )}
                  {book.discountPercentage > 0 && (
                    <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {book.discountPercentage}% Off
                    </div>
                  )}
                </div>

                {/* Price, Stock Status, and Quantity - Positioned below the image */}
                <div className="mt-6 space-y-3">
                  {/* Price */}
                  <div className="text-center">
                    {book.discountPercentage > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${calculateDiscountedPrice().toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ${book.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {book.price ? `$${book.price.toFixed(2)}` : 'Price not available'}
                      </span>
                    )}
                  </div>

                
                </div>
              </div>
            </div>

            {/* Book Details Section */}
            <div className="lg:w-3/5 p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
                  <p className="text-xl text-indigo-600 font-medium mb-2">by {book.authorName}</p>
                  {book.reviews && book.reviews.length > 0 && (
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            fill={i < Math.round(book.reviews.reduce((acc, review) => acc + review.rating, 0) / book.reviews.length) ? 'currentColor' : 'none'} 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-700 font-medium">
                        ({book.reviews.length > 0 ? (book.reviews.reduce((acc, review) => acc + review.rating, 0) / book.reviews.length).toFixed(1) : '0.0'})
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${book.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {book.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* About the Book Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About the Book</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>

              {/* Book Details and Technical Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Book Details Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Book Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Publisher:</span>
                      <span className="text-gray-900">{book.publisherName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Language:</span>
                      <span className="text-gray-900">{book.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Genre:</span>
                      <span className="text-gray-900">{book.genres && book.genres.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Format:</span>
                      <span className="text-gray-900">{book.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Publication Date:</span>
                      <span className="text-gray-900">{new Date(book.publicationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Award Winner:</span>
                      <span className="text-gray-900">{book.isAwardWinner ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Details Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Technical Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">ISBN:</span>
                      <span className="text-gray-900">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Stock:</span>
                      <span className="text-gray-900">{book.stockQuantity} copies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Available:</span>
                      <span className="text-gray-900">{book.isAvailable ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Added to System:</span>
                      <span className="text-gray-900">{new Date(book.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    disabled={quantity <= 1 || isAddingToCart}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-gray-900 font-medium">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    disabled={quantity >= 10 || quantity >= book.stockQuantity || isAddingToCart}
                  >
                    +
                  </button>
                </div>

                <button 
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    book.stockQuantity > 0 
                      ? isAddingToCart
                        ? 'bg-gray-400 cursor-wait'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={book.stockQuantity <= 0 || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {isAddingToCart ? 'Adding...' : book.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button 
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    book.stockQuantity > 0 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                  disabled={book.stockQuantity <= 0}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>

              {cartError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {cartError}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Reviews Section - Updated UI */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-left text-2xl font-bold text-gray-900">Customer Reviews</h2>
                {book.reviews && book.reviews.length > 0 && (
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill={i < Math.round(book.reviews.reduce((acc, review) => acc + review.rating, 0) / book.reviews.length) ? 'currentColor' : 'none'} 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {(book.reviews.reduce((acc, review) => acc + review.rating, 0) / book.reviews.length).toFixed(1)} out of 5
                    </span>
                    <span className="ml-2 text-gray-500">
                      ({book.reviews.length} {book.reviews.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
              
              {book.isPurchasedByUser && !userReview && (
                <button
                  onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 self-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Write a Review
                </button>
              )}
            </div>

            {/* Rating Summary */}
            {book.reviews && book.reviews.length > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = book.reviews.filter(r => r.rating === rating).length;
                    const percentage = book.reviews.length > 0 ? Math.round((count / book.reviews.length) * 100) : 0;
                    
                    return (
                      <div key={rating} className="flex items-center">
                        <div className="w-28 text-sm text-gray-600 flex items-center">
                          <span>{rating}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <div className="flex-1 h-4 mx-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-14 text-sm text-gray-500">{count} ({percentage}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review Form - Only show if not editing */}
            {book.isPurchasedByUser && !isEditingReview && !userReview && (
              <div id="review-form" className="mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Share Your Thoughts</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className={`p-2 rounded-full ${
                            reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      id="comment"
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="What did you like or dislike about this book? How was your reading experience?"
                      required
                    />
                  </div>
                  {reviewError && (
                    <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {reviewError}
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-all ${
                      isSubmittingReview
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmittingReview ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {/* Existing Reviews */}
            {book.reviews && book.reviews.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-left text-xl font-semibold text-gray-800">Customer Reviews</h3>
                </div>
                
                <div className="space-y-6">
                  {book.reviews.map((review, index) => (
                    <div key={index} className={`border ${userReview && userReview.id === review.id ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'} rounded-xl p-6 hover:shadow-md transition-shadow`}>
                      {isEditingReview && userReview && userReview.id === review.id ? (
                        <div className="bg-white p-6 rounded-lg border border-indigo-200 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-indigo-800">Edit Your Review</h3>
                            <button
                              onClick={() => {
                                setIsEditingReview(false);
                                setReviewForm({
                                  rating: 5,
                                  comment: '',
                                });
                              }}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                    className={`p-2 rounded-full ${
                                      reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                    } hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-4">
                              <label htmlFor="edit-comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                              </label>
                              <textarea
                                id="edit-comment"
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts about this book..."
                                required
                              />
                            </div>
                            {reviewError && (
                              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                                <div className="flex">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {reviewError}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-3">
                              <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className={`px-4 py-2 rounded-lg text-white font-medium ${
                                  isSubmittingReview
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {isSubmittingReview ? (
                                  <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                  </div>
                                ) : 'Update Review'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingReview(false);
                                  setReviewForm({
                                    rating: 5,
                                    comment: '',
                                  });
                                }}
                                className="px-4 py-2 rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div>
                              <div className="flex items-center mb-1">
                                <div className="flex mr-2 text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg 
                                      key={i} 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="h-5 w-5" 
                                      fill={i < review.rating ? 'currentColor' : 'none'} 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-gray-700 font-medium">{review.rating}/5</span>
                              </div>
                              <div>
                                <span className="text-gray-800 font-medium">{review.fullName}</span>
                                <div className="flex items-center text-gray-500 text-sm mt-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                            {userReview && userReview.id === review.id && (
                              <div className="flex items-center self-start sm:self-auto">
                                <div className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full mr-2">
                                  Your Review
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setIsEditingReview(true);
                                      setReviewForm({
                                        rating: review.rating,
                                        comment: review.comment
                                      });
                                    }}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
                                    title="Edit"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    disabled={isDeletingReview}
                                    className="p-1.5 text-red-600 hover:text-red-800 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Verified Purchase Badge */}
                          {review.isVerifiedPurchase && (
                            <div className="mb-3">
                              <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified Purchase
                              </span>
                            </div>
                          )}
                          
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {book.reviews && book.reviews.length > 5 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center">
                      <button className="px-3 py-1 rounded-md mr-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
                        Previous
                      </button>
                      <div className="flex space-x-1">
                        <button className="px-3 py-1 rounded-md bg-indigo-600 text-white">1</button>
                        <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">2</button>
                        <button className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">3</button>
                      </div>
                      <button className="px-3 py-1 rounded-md ml-2 bg-gray-100 text-gray-700 hover:bg-gray-200">
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-gray-600 text-lg mb-1">No reviews yet</p>
                <p className="text-gray-500">Be the first to share your thoughts on this book!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;