import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from '../components/FilterPanel';
import CategoryTabs from '../components/CategoryTabs';
import { FaHeart, FaShoppingCart, FaStar, FaFilter } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CATEGORY_ENDPOINTS = {
  all: 'https://localhost:7098/api/books/all',
  bestsellers: 'https://localhost:7098/api/books/best-sellers',
  awardWinners: 'https://localhost:7098/api/books/award-winners',
  newReleases: 'https://localhost:7098/api/books/new-releases',
  newArrivals: 'https://localhost:7098/api/books/new-arrivals',
  comingSoon: 'https://localhost:7098/api/books/coming-soon',
  deals: 'https://localhost:7098/api/books/deals',
};

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 12;
  const { addToCart } = useCart();
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    rating: 0,
    isbn: '',
    publicationDateRange: {
      start: '',
      end: new Date().toISOString().split('T')[0]
    },
    availability: 'all',
    authors: [],
    genres: [],
    formats: [],
    languages: [],
    publishers: []
  });
  const [showFilterPanel, setShowFilterPanel] = useState(true); // default to true for desktop

  // Add debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  // Update search input handler
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url;
        const params = {
          page: currentPage,
          pageSize: booksPerPage,
          sortBy: sortBy.replace('-desc', ''),
          ascending: !sortBy.includes('-desc'),
        };
  
        if (searchQuery) {
          url = 'https://localhost:7098/api/books/search';
          params.searchTerm = searchQuery;
        } else if (activeCategory === 'deals') {
          url = CATEGORY_ENDPOINTS.deals;
        } else if (activeCategory === 'bestsellers') {
          url = CATEGORY_ENDPOINTS.bestsellers;
        } else if (activeCategory === 'newReleases') {
          url = CATEGORY_ENDPOINTS.newReleases;
        } else {
          url = 'https://localhost:7098/api/books/filter';
          
          // Add filter parameters
          if (filters.authors.length > 0) {
            params.authorIds = filters.authors;
          }
          
          if (filters.genres.length > 0) {
            params.genreIds = filters.genres;
          }
          
          if (filters.publishers.length > 0) {
            params.publisherIds = filters.publishers;
          }
          
          if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) {
            params.minPrice = filters.priceRange[0];
            params.maxPrice = filters.priceRange[1];
          }
          
          if (filters.languages.length > 0) {
            params.language = filters.languages.join(',').toLowerCase();
          }
          
          if (filters.formats.length > 0) {
            params.format = filters.formats.join(',').toLowerCase();
          }
          
          if (filters.availability !== 'all') {
            params.isAvailable = filters.availability === 'inStock';
          }
          
          if (activeCategory === 'awardWinners') {
            params.isAwardWinner = true;
          }
          
          if (activeCategory === 'comingSoon') {
            params.isComingSoon = true;
          }
        }
  
        // Using axios's paramsSerializer to properly handle array parameters
        const response = await axios.get(url, { 
          params,
          paramsSerializer: params => {
            return Object.entries(params)
              .flatMap(([key, values]) => {
                // Handle arrays properly
                if (Array.isArray(values)) {
                  return values.map(value => `${key}=${value}`).join('&');
                }
                return `${key}=${values}`;
              })
              .join('&');
          }
        });
        
        const booksData = response.data.data?.items || [];
        const metadata = response.data.data?.metadata || {};
        
        // Debug logging
        console.log('Books data received:', booksData);
        booksData.forEach(book => {
          if (book.discountPercentage > 0) {
            console.log(`Book with discount: ${book.title} - ${book.discountPercentage}% off`);
          }
        });
        
        setBooks(booksData);
        setTotalItems(metadata.totalItems || 0);
        setTotalPages(metadata.totalPages || 1);
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to load books. Please try again later.');
        setBooks([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBooks();
  }, [activeCategory, currentPage, searchQuery, sortBy, filters]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const addToWishlist = async (book) => {
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

      showNotification(`${book.title} saved to your wishlist!`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error.response?.data?.message === "This book is already in your whitelist.") {
        showNotification('This book is already in your wishlist.', 'error');
      } else if (error.response?.data?.message === "User not found.") {
        showNotification('User not found. Please log in again.', 'error');
      } else if (error.response?.data?.message === "Book not found.") {
        showNotification('Book not found.', 'error');
      } else {
        showNotification('Failed to add to wishlist.', 'error');
      }
    }
  };

  const handleAddToCart = (book) => {
    try {
      addToCart({
        id: book.id,
        title: book.title,
        author: book.authorName,
        price: book.price,
        format: book.format || 'Paperback',
        img: book.coverImageUrl,
        quantity: 1
      });
      
      showNotification(`${book.title} added to your cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add to cart. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                  <div className="h-40 bg-gray-200 rounded col-span-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen p-6 container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book Catalog</h1>

        <CategoryTabs
          activeCategory={activeCategory}
          setActiveCategory={(category) => {
            setActiveCategory(category);
            setCurrentPage(1);
          }}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Icon and Panel */}
          <div className="flex flex-col">
            <button
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-white shadow hover:bg-gray-100 text-gray-700 focus:outline-none"
              onClick={() => setShowFilterPanel((prev) => !prev)}
              style={{ width: 'fit-content' }}
            >
              <FaFilter className="h-5 w-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            {showFilterPanel && (
              <FilterPanel 
                filters={filters}
                setFilters={setFilters}
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              {/* Search box remains unchanged */}
              <input
                type="text"
                placeholder="Search books by title or description..."
                className="border px-3 py-2 rounded-md w-full sm:w-1/2 focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
              <select
                className="border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="title">Sort: Title (A-Z)</option>
                <option value="price">Sort: Price (Low → High)</option>
                <option value="price-desc">Sort: Price (High → Low)</option>
                <option value="rating">Sort: Rating (High → Low)</option>
                <option value="publication-date">Sort: Publication Date (Newest)</option>
                <option value="popularity">Sort: Popularity (Most Sold)</option>
              </select>
            </div>

            <p className="text-gray-700 mb-4">{totalItems} books found</p>

            {books.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No books found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group"
                    >
                      <div 
                        className="cursor-pointer flex-grow"
                        onClick={() => {
                          window.location.href = `/bookdetails/${book.id}`;
                        }}
                      >
                        <div className="relative pb-[120%] bg-gray-100 group-hover:bg-gray-50 transition-colors duration-300">
                          {/* Badges Row */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
                            {book.isAwardWinner && (
                              <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold mr-2 whitespace-nowrap">
                                Award Winner
                              </div>
                            )}
                            {book.discountPercentage > 0 && (
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold ml-auto whitespace-nowrap">
                                {book.discountPercentage}% OFF
                              </div>
                            )}
                          </div>
                          <img
                            src={`https://localhost:7098${book.coverImageUrl || '/images/default-book.jpg'}`}
                            alt={book.title}
                            className="absolute h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxIDVIM2ExIDEgMCAwMC0xIDF2MTJhMSAxIDAgMDAxIDFoMThhMSAxIDAgMDAxLTFWNmExIDEgMCAwMC0xLTF6bS0xIDJ2Mkg0VjdoMTZ6bTAgNHY4SDR2LThoMTZ6IiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="p-4 flex-grow">
                          <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-2 h-14 group-hover:text-[#0F4C81] transition-colors duration-300">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">by {book.authorName || 'Unknown Author'}</p>
                          
                          <div className="mt-2 flex items-center gap-2">
                            {book.discountPercentage > 0 ? (
                              <>
                                <span className="text-lg font-bold text-[#0F4C81]">
                                  ${(book.price * (1 - book.discountPercentage / 100)).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${book.price.toFixed(2)}
                                </span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                  Save ${(book.price * (book.discountPercentage / 100)).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-[#0F4C81]">
                                ${book.price?.toFixed(2) || '0.00'}
                              </span>
                            )}
                          </div>
                          

                        </div>
                      </div>

                      <div className="p-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <button 
                            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-50 text-sm text-gray-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToWishlist(book);
                            }}
                          >
                           <FaHeart className="text-red-600 text-1xl" />
                            <span> Wishlist</span>
                          </button>
                          <button
                            className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm text-white transition-colors ${
                              book.isAvailable
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!book.isAvailable}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (book.isAvailable) {
                                handleAddToCart(book);
                              }
                            }}
                          >
                            <FaShoppingCart /> 
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#0F4C81] text-white hover:bg-[#0d3e6a]'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-md text-sm font-medium ${
                          currentPage === page 
                            ? 'bg-[#0F4C81] text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#0F4C81] text-white hover:bg-[#0d3e6a]'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default BookCatalog;