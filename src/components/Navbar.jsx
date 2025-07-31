import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaBell, FaHeart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const cartContext = useCart();
  const itemCount = !cartContext.isStaffUser() ? cartContext.itemCount : 0;
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in by checking for token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo and Brand Name */}
        <Link to="/">
          <h1 className="text-xl font-bold text-white hover:text-gray-200 transition-colors cursor-pointer">
            BookNest
          </h1>
        </Link>

        {/* Desktop Navigation Menu */}
        <ul className="hidden md:flex space-x-8 text-white">
          <li>
            <Link
              to="/"
              className="hover:text-gray-200 text-lg font-medium transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/BookCatalog"
              className="hover:text-gray-200 text-lg font-medium transition-colors duration-300"
            >
              Book Catalog
            </Link>
          </li>
          <li>
            <Link
              to="/announcements"
              className="hover:text-gray-200 text-lg font-medium transition-colors duration-300"
            >
              Announcements
            </Link>
          </li>
        </ul>

        {/* Mobile and Desktop Cart, Login, and Signup Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Wishlist Icon - Only show for customers */}
          {!cartContext.isStaffUser() && (
            <>
             {/* Notifications Bell Icon */}
              <Link to="/notifications" className="text-white hover:text-gray-200 text-xl relative">
                <FaBell />
                {/* Optional notification count badge */}
                {/* <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span> */}
              </Link>
              <Link to="/wishlist" className="text-white hover:text-gray-200 text-xl relative">
                <FaHeart />
              </Link>
             
            </>
          )}

          {/* Cart Icon - Only show for customers */}
          {!cartContext.isStaffUser() && (
            <Link to="/Cart" className="text-white hover:text-gray-200 text-xl relative">
              <FaShoppingCart />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          
          {/* Show Login/Signup buttons only when not logged in */}
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 border border-white text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 group"
              >
                <FaUser className="w-6 h-6 text-white hover:text-gray-200 transition-colors" />
                <svg
                  className={`w-4 h-4 text-white transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu with animation */}
              <div
                className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-200 ease-out z-50 ${
                  showDropdown
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation (Hamburger Menu) */}
      <div className="md:hidden flex items-center justify-between">
        <div className="text-xl text-white">
          <Link to="/" className="font-bold">Book Nest</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;