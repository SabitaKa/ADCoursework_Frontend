import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProfileSidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-l-4 border-blue-500' 
      : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="w-72 h-screen bg-white shadow-xl rounded-r-lg">
      <div className="p-6">
        <nav className="space-y-1">
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/profile')}`}
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">My Profile</span>
          </Link>
          
          <Link
            to="/profile/orders"
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/profile/orders')}`}
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <span className="font-medium">Order History</span>
          </Link>
          
          <Link
            to="/profile/change-password"
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/profile/change-password')}`}
          >
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Change Password</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;