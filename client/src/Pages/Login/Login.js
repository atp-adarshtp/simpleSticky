import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import config from '../../config';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await axios.post(config.REACT_APP_REMOTE_LOGIN_URL, {
        name,
        password
      }, {
        headers: {
          'x-api-key': 'your-secret-api-key'
        }
      });
      const { token } = response.data;
      localStorage.setItem('token', token); // Store the token in localStorage
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError('Login failed. Please check your username and password.');
    }
  };
  return (
    <div className="Login">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
