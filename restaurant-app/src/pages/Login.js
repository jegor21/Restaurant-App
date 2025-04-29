import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
import { UserContext } from '../UserContext';
import './../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login } = useContext(UserContext); 

  // Success messages
  const successMessage = location.state?.successMessage;
  const emailConfirmationMessage = location.state?.emailConfirmationMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        login(data.token); // UserContext
        navigate('/'); 
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error with login'); 
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      setError('Error connecting to server');
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      {successMessage && <p className="success-message">{successMessage}</p>} 
      {emailConfirmationMessage && <p className="info-message">{emailConfirmationMessage}</p>} 
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>
      <div className="question">
        Forgot your password? <Link to="/password-recovery">Recover password</Link>
      </div>
      <div className="question">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login;