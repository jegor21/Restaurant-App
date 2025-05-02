import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EmailConfirmationSuccess.css';

const EmailConfirmationSuccess = () => {
  return (
    <div className="email-confirmation-success">
      <h2>Email Confirmed Successfully</h2>
      <p>Your email has been confirmed. You can now log in to your account.</p>
      <Link to="/login">
        <button className="success-button">Go to Login</button>
      </Link>
    </div>
  );
};

export default EmailConfirmationSuccess;