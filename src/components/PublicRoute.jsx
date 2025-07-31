import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If user is authenticated, redirect to home page
  if (token) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated, render the child component (login/signup page)
  return children;
};

export default PublicRoute; 