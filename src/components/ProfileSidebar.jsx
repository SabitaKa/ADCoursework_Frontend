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
            <span className="font-medium" > My Profile </span>
          </Link>
          
          <Link
            to="/profile/orders"
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/profile/orders')}`}
          >
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <span className="font-medium">My Orders</span>
          </Link>
          
          <Link
            to="/profile/change-password"
            className={`flex items-center px-4 py-3 rounded-lg transition-all ${isActive('/profile/change-password')}`}
          >
            <div className="p-2 bg-gray-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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