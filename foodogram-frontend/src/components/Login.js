import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/LogSign.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <h1>Foodopia</h1>
          <img 
            src="/burger-camera-logo.png"
            alt="Foodopia Logo" 
            className="burger-logo"
          />
        </div>
        <h3 className="login-heading">Login to account, Chef!</h3>
        <form onSubmit={handleLogin}>
          <div className="input-wrapper">
            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash className="eye-icon" /> : <FaEye className="eye-icon" />}
            </button>
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && (
            <div className="error">
              <span>{error}</span>
            </div>
          )}
        </form>
        <div className="signup-link">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
