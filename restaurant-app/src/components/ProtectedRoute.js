import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './../styles/ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useContext(UserContext);
  const [showMessage, setShowMessage] = useState(false);

  
  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

  // If not auth, show a message and redirect to login
  if (!isAuthenticated) {
    if (!showMessage) {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        window.location.href = '/login'; 
      }, 5000); 
    }
    return (
      <div className="unauth-message">
        <h2>Access Denied</h2>
        <p>You must log in to access this page.</p>
        <p>Redirecting to the login page in 5 seconds...</p>
      </div>
    );
  }

  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }


  return children;
};

export default ProtectedRoute;