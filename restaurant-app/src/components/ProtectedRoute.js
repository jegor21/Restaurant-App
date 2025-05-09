import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import './../styles/ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Kasutaja autentimise ja rolli kontrollimine kontekstist
  const { isAuthenticated, user } = useContext(UserContext);
  const [showMessage, setShowMessage] = useState(false);

  // Kui autentimisstaatus on veel määramata
  if (isAuthenticated === null) {
    return <div>Laadimine...</div>; 
  }

  // Kui kasutaja pole sisse logitud
  if (!isAuthenticated) {
    if (!showMessage) {
      setShowMessage(true);
      // Siit suuname kasutaja sisse logimise lehele pärast 5 sekundi ootamist
      setTimeout(() => {
        setShowMessage(false);
        window.location.href = '/login'; 
      }, 5000); 
    }
    return (
      <div className="unauth-message">
        <h2>Juurdepääs keelatud</h2>
        <p>Peate sisse logima, et sellele lehele pääseda.</p>
        <p>Suundumine sisse logimise lehele 5 sekundi pärast...</p>
      </div>
    );
  }

  // Kui on määratud vajalik roll ja kasutaja roll ei vasta sellele
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />; // Suuname kasutaja avalehele
  }

  // Kui kõik on korras, siis kuvatakse lastud komponendid
  return children;
};

export default ProtectedRoute;
