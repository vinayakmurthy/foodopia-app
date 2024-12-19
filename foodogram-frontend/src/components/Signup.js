import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/LogSign.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/signup', { username, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        <h3 className="login-heading">Create your account, Chef!</h3>
        <form onSubmit={handleSignup}>
          <div className="input-wrapper">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleConfirmPasswordVisibility}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <FaEyeSlash className="eye-icon" /> : <FaEye className="eye-icon" />}
            </button>
          </div>
          <button type="submit" className="login-button">Sign Up</button>
          {error && (
            <div className="error">
              <span>{error}</span>
            </div>
          )}
        </form>
        <div className="signup-link">
          <p>Already have an account? <a href="/">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
