import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import config from '../../config';
import './Login.css'; // Custom CSS for advanced styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        config.REACT_APP_REMOTE_LOGIN_URL,
        { email, password },
        { headers: { 'x-api-key': 'your-secret-api-key' } }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Login failed. Please check your username and password.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background"></div>
      <div className="login-container">
        <h1 className="login-title">Unlock Your World</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="relative inline-block px-8 py-3 text-lg font-bold text-gray-800 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 border-2 border-blue-400 rounded-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
            Log In
          </button>
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
