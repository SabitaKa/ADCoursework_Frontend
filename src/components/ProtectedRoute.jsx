import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not in allowed roles, redirect to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 