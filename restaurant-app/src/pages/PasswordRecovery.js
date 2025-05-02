import React, { useState } from 'react';
import '../styles/PasswordRecovery.css';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/password-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send recovery email');
      }
    } catch (error) {
      console.error('Error during password recovery:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="password-recovery-page">
      <h2>Password Recovery</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <button type="submit">Send Recovery Email</button>
        <div className="question">No need password recovery? <a href="/login">Login</a></div>
        
      </form>
    </div>
  );
};

export default PasswordRecovery;